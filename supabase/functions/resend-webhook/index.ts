import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    // Optional: Secret token to authenticate that the webhook comes from Resend
    // Set this as a secret inside Supabase if you want verification
    const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();

    console.log("Received Resend Webhook Event:", JSON.stringify(body));

    const eventType = body.type; // e.g. email.delivered, email.bounced, email.opened
    const eventData = body.data || {};
    const resendEmailId = eventData.email_id;

    if (!resendEmailId) {
      return new Response(JSON.stringify({ error: "bad_request", message: "Missing email_id in payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Find the matching email log row where resend_email_id is stored in metadata
    const { data: logEntry, error: findError } = await supabaseAdmin
      .from("email_logs")
      .select("*")
      .raw(`metadata->>'resend_email_id' = '${resendEmailId}'`) // Query by JSON key
      .maybeSingle();

    // Alternate lookup since raw query filters aren't always standard:
    // Fetch recent pending/sent logs and filter in-memory if needed, but JSONB containment is preferred.
    let targetLog = logEntry;
    if (findError || !targetLog) {
      // Fallback robust search: Query using jsonb contains filter
      const { data: fallbackList } = await supabaseAdmin
        .from("email_logs")
        .select("*")
        .contains("metadata", { resend_email_id: resendEmailId })
        .limit(1);
        
      if (fallbackList && fallbackList.length > 0) {
        targetLog = fallbackList[0];
      }
    }

    if (!targetLog) {
      console.warn(`No email log match found for Resend Email ID: ${resendEmailId}`);
      return new Response(JSON.stringify({ success: false, message: "No matching log found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Map Resend webhook events to our DB statuses
    let dbStatus = targetLog.status;
    if (eventType === "email.delivered") {
      dbStatus = "delivered";
    } else if (eventType === "email.bounced") {
      dbStatus = "failed";
    } else if (eventType === "email.opened") {
      dbStatus = "opened";
    } else if (eventType === "email.clicked") {
      dbStatus = "clicked";
    }

    // Append webhook event history to the log's metadata
    const currentMetadata = targetLog.metadata || {};
    const webhookEvents = currentMetadata.webhook_events || [];
    webhookEvents.push({
      event: eventType,
      received_at: new Date().toISOString(),
      payload: body
    });

    const updatedMetadata = {
      ...currentMetadata,
      webhook_events: webhookEvents
    };

    // Update the email log in Supabase
    const { error: updateError } = await supabaseAdmin
      .from("email_logs")
      .update({
        status: dbStatus,
        metadata: updatedMetadata,
        error_message: eventType === "email.bounced" ? `Bounced: ${JSON.stringify(eventData.bounce || {})}` : targetLog.error_message
      })
      .eq("id", targetLog.id);

    if (updateError) {
      console.error("Failed to update email log status:", updateError);
      throw updateError;
    }

    console.log(`Successfully updated Email Log ${targetLog.id} to status: ${dbStatus}`);
    
    return new Response(JSON.stringify({ success: true, log_id: targetLog.id, new_status: dbStatus }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (e: any) {
    console.error("resend-webhook exception:", e);
    return new Response(JSON.stringify({ error: "internal_error", message: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

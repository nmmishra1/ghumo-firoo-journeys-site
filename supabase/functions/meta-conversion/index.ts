import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PIXEL_ID = Deno.env.get('META_PIXEL_ID') || '1111618530664737';

async function sha256(message: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event_name, event_time, user_data, custom_data, event_source_url, action_source } = await req.json();

    const accessToken = Deno.env.get('META_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('META_ACCESS_TOKEN is not configured in environment variables');
      return new Response(
        JSON.stringify({ error: 'Meta Conversions API is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const processedUserData: any = {};
    if (user_data) {
      if (user_data.em && !isHashed(user_data.em)) {
        processedUserData.em = await sha256(user_data.em.toLowerCase().trim());
      } else if (user_data.em) {
        processedUserData.em = user_data.em;
      }

      if (user_data.ph && !isHashed(user_data.ph)) {
        processedUserData.ph = await sha256(user_data.ph.replace(/[^0-9]/g, ''));
      } else if (user_data.ph) {
        processedUserData.ph = user_data.ph;
      }
      
      // Copy other common fields
      if (user_data.client_ip_address) processedUserData.client_ip_address = user_data.client_ip_address;
      if (user_data.client_user_agent) processedUserData.client_user_agent = user_data.client_user_agent;
      if (user_data.fbp) processedUserData.fbp = user_data.fbp;
      if (user_data.fbc) processedUserData.fbc = user_data.fbc;
      if (user_data.fn) processedUserData.fn = await sha256(user_data.fn.toLowerCase().trim()); // First Name
      if (user_data.ln) processedUserData.ln = await sha256(user_data.ln.toLowerCase().trim()); // Last Name
      if (user_data.ct) processedUserData.ct = await sha256(user_data.ct.toLowerCase().trim()); // City
      if (user_data.st) processedUserData.st = await sha256(user_data.st.toLowerCase().trim()); // State
      if (user_data.zp) processedUserData.zp = await sha256(user_data.zp.toLowerCase().trim()); // Zip
      if (user_data.country) processedUserData.country = await sha256(user_data.country.toLowerCase().trim()); // Country
    }

    const payload = {
      data: [
        {
          event_name: event_name || 'ViewContent',
          event_time: event_time || Math.floor(Date.now() / 1000),
          action_source: action_source || 'website',
          event_source_url: event_source_url,
          user_data: processedUserData,
          custom_data: custom_data,
        },
      ],
    };

    console.log(`Sending event ${event_name} to Meta CAPI`);

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Meta CAPI error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

function isHashed(str: string): boolean {
  // Simple check if string looks like a SHA256 hash (64 hex chars)
  return /^[a-f0-9]{64}$/i.test(str);
}

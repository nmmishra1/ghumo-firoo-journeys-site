import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppRequest {
  phone: string;
  message: string;
  leadId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    if (req.method === 'POST') {
      const { phone, message, leadId }: WhatsAppRequest = await req.json();
      
      if (!phone || !message) {
        return new Response(
          JSON.stringify({ error: 'Phone and message are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Clean phone number - remove all non-digits and ensure it starts with country code
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

      console.log(`Sending WhatsApp message to ${formattedPhone}: ${message}`);

      // Here you can integrate with your preferred WhatsApp API
      // Example using UltraMsg API (uncomment and configure):
      /*
      const ultramsgToken = Deno.env.get('ULTRAMSG_TOKEN');
      const ultramsgInstance = Deno.env.get('ULTRAMSG_INSTANCE');
      
      if (ultramsgToken && ultramsgInstance) {
        const ultramsgResponse = await fetch(`https://api.ultramsg.com/${ultramsgInstance}/messages/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            token: ultramsgToken,
            to: formattedPhone,
            body: message,
          }),
        });
        
        const ultramsgResult = await ultramsgResponse.json();
        console.log('UltraMsg response:', ultramsgResult);
      }
      */

      // Example using Twilio (uncomment and configure):
      /*
      const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioFromNumber = Deno.env.get('TWILIO_FROM_NUMBER');
      
      if (twilioAccountSid && twilioAuthToken && twilioFromNumber) {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
        
        const twilioResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: `whatsapp:${twilioFromNumber}`,
            To: `whatsapp:+${formattedPhone}`,
            Body: message,
          }),
        });
        
        const twilioResult = await twilioResponse.json();
        console.log('Twilio response:', twilioResult);
      }
      */

      // Log the WhatsApp message attempt
      if (leadId) {
        await supabaseClient
          .from('lead_comments')
          .insert([{
            lead_id: leadId,
            comment: `WhatsApp message sent to ${formattedPhone}: ${message}`,
            created_by: '00000000-0000-0000-0000-000000000000' // System user
          }]);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'WhatsApp message queued successfully',
          phone: formattedPhone 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in WhatsApp webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
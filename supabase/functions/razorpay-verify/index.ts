import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function hmacSha256(keySecret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyBuf = encoder.encode(keySecret);
  const msgBuf = encoder.encode(message);
  
  const key = await crypto.subtle.importKey(
    "raw",
    keyBuf,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const sigBuf = await crypto.subtle.sign("HMAC", key, msgBuf);
  const sigArray = Array.from(new Uint8Array(sigBuf));
  return sigArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') || '';

    if (!RAZORPAY_KEY_SECRET) {
      return new Response(JSON.stringify({ error: 'razorpay_not_configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    
    const expectedSignature = await hmacSha256(RAZORPAY_KEY_SECRET, payload);
    
    if (expectedSignature === razorpay_signature) {
      return new Response(JSON.stringify({ verified: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ verified: false }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (e: any) {
    console.error('razorpay-verify error:', e);
    return new Response(JSON.stringify({ error: 'verification_failed', message: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

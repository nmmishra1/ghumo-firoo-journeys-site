import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function sha512(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-512', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const PAYU_KEY = Deno.env.get('PAYU_KEY') || '';
    const PAYU_SALT = Deno.env.get('PAYU_SALT') || '';
    const SERVER_BASE_URL = Deno.env.get('SERVER_BASE_URL') || 'https://ghumofiroo.com';

    if (!PAYU_KEY || !PAYU_SALT) {
      return new Response(JSON.stringify({ error: 'payu_not_configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { amount, productinfo, firstname, email, phone } = await req.json();
    const txnid = 'Txn' + Date.now() + Math.floor(Math.random() * 1000);

    // PayU Hash: key|txnid|amount|productinfo|firstname|email|||||||||||salt
    const hashString = `${PAYU_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_SALT}`;
    const hash = await sha512(hashString);

    return new Response(JSON.stringify({
      key: PAYU_KEY,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      hash,
      surl: `${SERVER_BASE_URL}/thank-you?payment=success&gateway=payu`,
      furl: `${SERVER_BASE_URL}/booking-failed?payment=failure&gateway=payu`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (e) {
    console.error('payu-generate-hash error:', e);
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

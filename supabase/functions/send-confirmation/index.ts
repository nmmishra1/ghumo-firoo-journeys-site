import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function getBrochureBanner(destination: string): string {
  const d = (destination || "").toLowerCase();
  if (d.indexOf("char dham") !== -1 || d.indexOf("chardham") !== -1 || d.indexOf("kedarnath") !== -1 || d.indexOf("badrinath") !== -1 || d.indexOf("yamunotri") !== -1 || d.indexOf("gangotri") !== -1) {
    return "https://ghumofiroo.com/chardham-by-helicopter.jpg";
  } else if (d.indexOf("rann") !== -1 || d.indexOf("utsav") !== -1 || d.indexOf("kutch") !== -1) {
    return "https://ghumofiroo.com/Rann-Utsav-Gujarat.png";
  } else if (d.indexOf("bali") !== -1) {
    return "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("dubai") !== -1) {
    return "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("europe") !== -1) {
    return "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("kashmir") !== -1) {
    return "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("ladakh") !== -1 || d.indexOf("leh") !== -1) {
    return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("goa") !== -1) {
    return "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("georgia") !== -1) {
    return "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("kerala") !== -1) {
    return "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("singapore") !== -1) {
    return "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("thailand") !== -1) {
    return "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("japan") !== -1) {
    return "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("rajasthan") !== -1 || d.indexOf("jaisalmer") !== -1 || d.indexOf("jaipur") !== -1 || d.indexOf("udaipur") !== -1) {
    return "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("turkey") !== -1) {
    return "https://images.unsplash.com/photo-1524230572899-a752b3835840?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("himachal") !== -1 || d.indexOf("manali") !== -1 || d.indexOf("shimla") !== -1) {
    return "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("mauritius") !== -1) {
    return "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("seychelles") !== -1) {
    return "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("golden") !== -1 || d.indexOf("triangle") !== -1) {
    return "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80";
  } else {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { email, name, packageTitle, type, bookingId } = await req.json();

    const isBooking = type === 'booking';
    const subject = isBooking
      ? `Booking Request Received: ${packageTitle} - Ghumo Firoo`
      : `Enquiry Received: ${packageTitle}`;

    const banner = getBrochureBanner(packageTitle);
    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b; background-color: #ffffff; box-shadow: 0 8px 30px rgba(0,0,0,0.08);">
        <!-- LOGO -->
        <div style="background-color: #ffffff; text-align: center; padding: 28px 24px 18px 24px;">
          <img src="https://ghumofiroo.com/ghumo-firoo-logo.png" alt="Ghumo Firoo Travels" style="max-height: 64px; width: auto; display: inline-block;" />
        </div>

        <!-- HERO BANNER -->
        <img src="${banner}" alt="${packageTitle} Banner" style="width: 100%; height: 250px; object-fit: cover; display: block;" />

        <!-- BODY CONTENT -->
        <div style="padding: 28px 24px;">
          <h2 style="color: #ea580c; margin: 0 0 14px 0; font-size: 18px; font-weight: 700;">Hello ${name},</h2>
          
          <p style="font-size: 14px; color: #475569; line-height: 1.7; margin: 0 0 20px 0;">
            Thank you for choosing <strong style="color:#ea580c;">Ghumo Firoo Travels</strong>!
            We are thrilled to assist you in planning your next escape. We are dedicated to crafting an exceptional travel experience customized just for you.
          </p>

          <!-- INQUIRY CARD -->
          <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-left: 4px solid #ea580c; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <p style="font-size: 12px; font-weight: 800; color: #ea580c; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0;">📋 Details</p>

            <div style="padding: 10px 0; border-bottom: 1px solid #fde8d0;">
              <span style="font-size: 11px; font-weight: 700; color: #9a3412; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Reference ID</span>
              <span style="font-size: 14px; font-weight: 600; color: #1e293b; display: block; word-break: break-word;">${bookingId || 'GF-' + Date.now()}</span>
            </div>
            <div style="padding: 10px 0; border-bottom: 1px solid #fde8d0;">
              <span style="font-size: 11px; font-weight: 700; color: #9a3412; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Package Interest</span>
              <span style="font-size: 14px; font-weight: 600; color: #1e293b; display: block; word-break: break-word;">${packageTitle}</span>
            </div>
            <div style="padding: 10px 0; border-bottom: none; padding-bottom: 0;">
              <span style="font-size: 11px; font-weight: 700; color: #9a3412; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Status</span>
              <span style="font-size: 14px; font-weight: 600; color: #1e293b; display: block; word-break: break-word;">${isBooking ? 'Payment Pending' : 'Processing'}</span>
            </div>
          </div>

          <p style="font-size: 14px; color: #475569; line-height: 1.7; margin: 0 0 20px 0;">
            ${isBooking 
              ? "Thank you for submitting your booking details. To finalize your reservation, please ensure you complete the payment using the options provided on our website. Once payment is verified, we will issue your travel vouchers."
              : "Thank you for your enquiry. Our travel experts are reviewing your request and will contact you within 24 hours with a customized itinerary."}
          </p>

          <!-- CTA BUTTON -->
          <div style="text-align: center; padding: 20px 0 10px 0;">
            <a href="https://ghumofiroo.com" style="display: inline-block; background: linear-gradient(135deg, #ea580c, #f97316); color: #ffffff !important; text-decoration: none; padding: 14px 36px; font-weight: 800; border-radius: 50px; font-size: 14px; letter-spacing: 0.3px; box-shadow: 0 6px 20px rgba(234,88,12,0.35);" target="_blank">✈️ View Details</a>
          </div>

          <p style="font-size: 14px; color: #475569; margin: 20px 0 0 0;">Warm regards,</p>
          <p style="font-size: 15px; font-weight: 800; color: #ea580c; margin: 6px 0 0 0;">Ghumo Firoo Travels Team</p>
        </div>

        <!-- FOOTER -->
        <div style="background-color: #0f172a; padding: 32px 24px; text-align: center;">
          <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 800; color: #ffffff; margin: 0 0 4px 0; letter-spacing: 0.5px;">✦ Ghumo Firoo Travels ✦</p>
          <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #f97316; font-style: italic; margin: 0 0 16px 0;">Where Dreams Become Itineraries</p>
          <div style="height: 1px; background-color: #1e293b; margin: 16px 0;"></div>
          <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #94a3b8; margin: 0 0 6px 0; line-height: 1.8;">
            📞 <a href="tel:+919910987264" style="color: #f97316 !important; text-decoration: none; font-weight: 600;">+91 99109 87264</a>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            📧 <a href="mailto:info@ghumofiroo.com" style="color: #f97316 !important; text-decoration: none; font-weight: 600;">info@ghumofiroo.com</a>
          </p>
          <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #94a3b8; margin: 0 0 16px 0;">
            🌐 <a href="https://ghumofiroo.com" style="color: #f97316 !important; text-decoration: none; font-weight: 600;" target="_blank">www.ghumofiroo.com</a>
          </p>
          <div style="height: 1px; background-color: #1e293b; margin: 16px 0;"></div>
          
          <!-- Social Media Section -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 15px; margin-bottom: 15px;">
            <tr>
              <td align="center" valign="top" style="padding: 0 5px; width: 33.33%;">
                <a href="https://www.facebook.com/ghumofirootravels" target="_blank" style="text-decoration: none; display: inline-block;">
                  <img src="https://img.icons8.com/color/48/facebook-new.png" width="24" height="24" alt="Facebook" style="display: block; margin: 0 auto 6px auto; border: 0;" />
                  <span style="font-size: 10px; color: #94a3b8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; display: block; line-height: 1.2; word-break: break-word;">facebook.com</span>
                </a>
              </td>
              <td align="center" valign="top" style="padding: 0 5px; width: 33.33%;">
                <a href="https://www.instagram.com/ghumofirootravels/" target="_blank" style="text-decoration: none; display: inline-block;">
                  <img src="https://img.icons8.com/color/48/instagram-new.png" width="24" height="24" alt="Instagram" style="display: block; margin: 0 auto 6px auto; border: 0;" />
                  <span style="font-size: 10px; color: #94a3b8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; display: block; line-height: 1.2; word-break: break-word;">instagram.com</span>
                </a>
              </td>
              <td align="center" valign="top" style="padding: 0 5px; width: 33.33%;">
                <a href="https://x.com/GhumoFiroo" target="_blank" style="text-decoration: none; display: inline-block;">
                  <img src="https://img.icons8.com/color/48/twitterx.png" width="24" height="24" alt="Twitter/X" style="display: block; margin: 0 auto 6px auto; border: 0;" />
                  <span style="font-size: 10px; color: #94a3b8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; display: block; line-height: 1.2; word-break: break-word;">x.com</span>
                </a>
              </td>
            </tr>
          </table>

          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; color: #64748b; margin-top: 15px;">
            © ${new Date().getFullYear()} GHUMO FIROO TRAVELS • ALL RIGHTS RESERVED
          </div>
        </div>
      </div>
    `;

    // Use Supabase's built-in SMTP or Resend API
    // We'll use fetch to call SMTP2GO / Brevo / or any HTTP email API
    const SMTP_HOST = Deno.env.get('SMTP_HOST') || 'mail.ghumofiroo.com';
    const SMTP_USER = Deno.env.get('SMTP_USER') || 'noreply@ghumofiroo.com';
    const SMTP_PASS = Deno.env.get('SMTP_PASS') || '';
    const SMTP_PORT = Deno.env.get('SMTP_PORT') || '465';

    // Use SMTP via fetch to smtp2go API or similar
    // For now, log and return success (SMTP from Deno requires a library)
    // Best option: use Resend.com free tier (100 emails/day)
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Ghumo Firoo Travels <noreply@ghumofiroo.com>',
          to: [email],
          subject,
          html,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error('Resend error:', err);
        return new Response(JSON.stringify({ error: 'email_failed', detail: err }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } else {
      // Fallback: log that email was not sent (no API key configured)
      console.warn('RESEND_API_KEY not set. Email not sent to:', email);
    }

    console.log(`Confirmation processed for ${email} | type: ${type}`);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (e) {
    console.error('send-confirmation error:', e);
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

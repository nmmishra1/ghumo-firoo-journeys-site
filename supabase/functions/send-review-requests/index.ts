import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || '';
    const siteUrl = Deno.env.get('SITE_URL') || 'https://ghumofiroo.com';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    if (!resendApiKey) {
      throw new Error('Missing RESEND_API_KEY environment variable');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch pending review requests
    const { data: itineraries, error: fetchError } = await supabaseAdmin.rpc('send_pending_review_emails_fetch');
    if (fetchError) {
      console.error('Error fetching pending review emails:', fetchError);
      return new Response(JSON.stringify({ error: 'fetch_pending_failed', detail: fetchError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!itineraries || itineraries.length === 0) {
      return new Response(JSON.stringify({ success: true, count: 0, message: 'No pending review requests' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const successfulIds: string[] = [];

    for (const itin of itineraries) {
      try {
        const destName = itin.destinations && itin.destinations.length > 0 ? itin.destinations[0] : 'your recent trip';
        const reviewLink = `${siteUrl}/review/${itin.itinerary_code}`;
        const banner = getBrochureBanner(destName);
        
        const emailHtml = `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b; background-color: #ffffff; box-shadow: 0 8px 30px rgba(0,0,0,0.08);">
            <!-- LOGO -->
            <div style="background-color: #ffffff; text-align: center; padding: 28px 24px 18px 24px;">
              <img src="https://ghumofiroo.com/ghumo-firoo-logo.png" alt="Ghumo Firoo Travels" style="max-height: 64px; width: auto; display: inline-block;" />
            </div>

            <!-- HERO BANNER -->
            <img src="${banner}" alt="${destName} Banner" style="width: 100%; height: 220px; object-fit: cover; display: block;" />

            <!-- BODY CONTENT -->
            <div style="padding: 28px 24px;">
              <h2 style="color: #ea580c; margin: 0 0 14px 0; font-size: 20px; font-weight: 700; text-align: center;">How was your trip with Ghumo Firoo?</h2>
              
              <p style="font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 20px 0;">
                Hello <strong>${itin.customer_name}</strong>,
              </p>
              <p style="font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 20px 0;">
                Welcome back! We hope you had a fantastic and memorable time exploring <strong>${destName}</strong>. 
                Our team at Ghumo Firoo Travels strives to deliver the best travel experiences, and we would love to hear your feedback.
              </p>
              <p style="font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 20px 0;">
                Could you take 2 minutes to rate your overall experience, hotels, transport, sightseeing, and planning? Your feedback helps us maintain high quality standards and assists other travelers in planning their dream holidays.
              </p>

              <!-- CTA BUTTON -->
              <div style="text-align: center; padding: 20px 0 10px 0;">
                <a href="${reviewLink}" style="display: inline-block; background: linear-gradient(135deg, #ea580c, #f97316); color: #ffffff !important; text-decoration: none; padding: 14px 36px; font-weight: 800; border-radius: 50px; font-size: 14px; letter-spacing: 0.3px; box-shadow: 0 6px 20px rgba(234,88,12,0.35);" target="_blank">⭐ Write A Review</a>
              </div>

              <p style="font-size: 14px; color: #94a3b8; text-align: center; margin-top: 15px;">
                If the button doesn't work, copy and paste this link in your browser:<br/>
                <a href="${reviewLink}" style="color: #ea580c; text-decoration: underline;">${reviewLink}</a>
              </p>

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
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; color: #64748b; margin-top: 15px;">
                © ${new Date().getFullYear()} GHUMO FIROO TRAVELS • ALL RIGHTS RESERVED
              </div>
            </div>
          </div>
        `;

        // Send via Resend API
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Ghumo Firoo Travels <booking@ghumofiroo.com>',
            to: [itin.customer_email],
            subject: 'How was your trip with Ghumo Firoo?',
            html: emailHtml,
          }),
        });

        if (emailRes.ok) {
          successfulIds.push(itin.id);
          console.log(`Review invitation sent to ${itin.customer_email} for booking ${itin.itinerary_code}`);
        } else {
          const errText = await emailRes.text();
          console.error(`Resend API error for ${itin.customer_email}:`, errText);
        }
      } catch (sendErr) {
        console.error(`Failed to send review email to ${itin.customer_email}:`, sendErr);
      }
    }

    if (successfulIds.length > 0) {
      const { error: updateErr } = await supabaseAdmin.rpc('mark_review_request_sent', { itin_ids: successfulIds });
      if (updateErr) {
        console.error('Error marking review requests as sent in DB:', updateErr);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      count: successfulIds.length, 
      total: itineraries.length,
      message: `Successfully sent ${successfulIds.length} review requests.` 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (e: any) {
    console.error('Review email requests failed:', e);
    return new Response(JSON.stringify({ error: 'send_requests_failed', message: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

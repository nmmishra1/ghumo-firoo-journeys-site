import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TravelEnquiryRequest {
  customerData: {
    name: string;
    email: string;
    phone: string;
    destination?: string;
    budget?: string;
    travelDates?: string;
    groupSize?: string;
    message?: string;
  };
  type: 'travel_dreams' | 'contact' | 'enquiry';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerData, type }: TravelEnquiryRequest = await req.json();

    // Send confirmation email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "Ghumo Firoo Travels <booking@ghumofiroo.com>",
      to: [customerData.email],
      subject: "Thank you for your travel enquiry!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #f97316; text-align: center;">Thank You for Your Enquiry!</h1>
          
          <p>Dear ${customerData.name},</p>
          
          <p>Thank you for sharing your travel dreams with Ghumo Firoo Travels! We're excited to help you plan your perfect trip.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Enquiry Details:</h3>
            <p><strong>Name:</strong> ${customerData.name}</p>
            <p><strong>Phone:</strong> ${customerData.phone}</p>
            <p><strong>Email:</strong> ${customerData.email}</p>
            ${customerData.destination ? `<p><strong>Destination:</strong> ${customerData.destination}</p>` : ''}
            ${customerData.budget ? `<p><strong>Budget:</strong> ${customerData.budget}</p>` : ''}
            ${customerData.travelDates ? `<p><strong>Travel Dates:</strong> ${customerData.travelDates}</p>` : ''}
            ${customerData.groupSize ? `<p><strong>Group Size:</strong> ${customerData.groupSize}</p>` : ''}
            ${customerData.message ? `<p><strong>Message:</strong> ${customerData.message}</p>` : ''}
          </div>
          
          <p>Our travel experts will review your requirements and get back to you within 24 hours with a customized travel plan.</p>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Quick Contact:</strong></p>
            <p style="margin: 5px 0;">📞 Phone: +91 9910987264</p>
            <p style="margin: 5px 0;">📧 Email: booking@ghumofiroo.com</p>
            <p style="margin: 5px 0;">💬 WhatsApp: <a href="https://wa.me/919910987264">Click to Chat</a></p>
          </div>
          
          <p>Thank you for choosing Ghumo Firoo Travels!</p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            Team Ghumo Firoo Travels<br>
            <em>"Your Dream Journey Starts Here"</em>
          </p>
        </div>
      `,
    });

    // Send notification email to agency
    const agencyEmailResponse = await resend.emails.send({
      from: "Ghumo Firoo CRM <booking@ghumofiroo.com>",
      to: ["info@ghumofiroo.com"],
      subject: `New Travel Enquiry from ${customerData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #f97316;">New Travel Enquiry Received!</h1>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Customer Details:</h3>
            <p><strong>Name:</strong> ${customerData.name}</p>
            <p><strong>Phone:</strong> ${customerData.phone}</p>
            <p><strong>Email:</strong> ${customerData.email}</p>
            ${customerData.destination ? `<p><strong>Destination:</strong> ${customerData.destination}</p>` : ''}
            ${customerData.budget ? `<p><strong>Budget:</strong> ${customerData.budget}</p>` : ''}
            ${customerData.travelDates ? `<p><strong>Travel Dates:</strong> ${customerData.travelDates}</p>` : ''}
            ${customerData.groupSize ? `<p><strong>Group Size:</strong> ${customerData.groupSize}</p>` : ''}
            ${customerData.message ? `<p><strong>Message:</strong> ${customerData.message}</p>` : ''}
          </div>
          
          <p style="color: #d97706;"><strong>Action Required:</strong> Please follow up with this customer within 24 hours.</p>
          
          <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Quick Actions:</strong></p>
            <p style="margin: 5px 0;">📞 Call: <a href="tel:${customerData.phone}">${customerData.phone}</a></p>
            <p style="margin: 5px 0;">📧 Email: <a href="mailto:${customerData.email}">${customerData.email}</a></p>
            <p style="margin: 5px 0;">💬 WhatsApp: <a href="https://wa.me/${customerData.phone.replace(/\D/g, '')}">Send WhatsApp</a></p>
          </div>
        </div>
      `,
    });

    // Send WhatsApp message (optional - requires WhatsApp Business API)
    try {
      const whatsappMessage = `Thank you for contacting Ghumo Firoo Travels! 🙏

Hi ${customerData.name}, we received your enquiry for ${customerData.destination || 'your dream destination'}. Our travel experts will contact you within 24 hours with a customized plan.

Quick Contact:
📞 +91 9910987264
📧 booking@ghumofiroo.com

Visit our packages: https://ghumofiroo.com/products

Thank you for choosing us! ✈️`;

      // Note: This would require actual WhatsApp Business API integration
      // For now, we'll just log it
      console.log('WhatsApp message to send:', whatsappMessage);
      
    } catch (whatsappError) {
      console.error('WhatsApp error:', whatsappError);
      // Don't fail the entire process if WhatsApp fails
    }

    console.log("Travel enquiry emails sent successfully:", {
      customer: customerEmailResponse,
      agency: agencyEmailResponse
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Enquiry processed successfully",
      emailsSent: {
        customer: customerEmailResponse.data?.id || 'success',
        agency: agencyEmailResponse.data?.id || 'success'
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-travel-enquiry function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
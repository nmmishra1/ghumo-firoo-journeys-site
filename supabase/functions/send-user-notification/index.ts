import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  email: string;
  fullName: string;
  role: string;
  approved: boolean;
  type: 'creation' | 'approval' | 'role_update';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, role, approved, type }: NotificationRequest = await req.json();

    let subject = "";
    let message = "";

    switch (type) {
      case 'creation':
        subject = "Welcome to Ghumo Firoo Travel CRM";
        message = `
          <h1>Welcome to Ghumo Firoo Travel CRM, ${fullName}!</h1>
          <p>Your account has been created with the following details:</p>
          <ul>
            <li>Email: ${email}</li>
            <li>Role: ${role}</li>
            <li>Status: ${approved ? 'Approved' : 'Pending Admin Approval'}</li>
          </ul>
          ${approved ? 
            '<p>You can now log in to the CRM dashboard and start managing your leads.</p>' :
            '<p>Your account is pending admin approval. You will receive another email once approved.</p>'
          }
          <p>Best regards,<br>Ghumo Firoo Travel Team</p>
        `;
        break;
      
      case 'approval':
        subject = "Your Ghumo Firoo Travel CRM Account Has Been Approved";
        message = `
          <h1>Congratulations ${fullName}!</h1>
          <p>Your Ghumo Firoo Travel CRM account has been approved.</p>
          <p>Account Details:</p>
          <ul>
            <li>Email: ${email}</li>
            <li>Role: ${role}</li>
            <li>Status: Approved</li>
          </ul>
          <p>You can now log in to the CRM dashboard and start managing your leads.</p>
          <p>Best regards,<br>Ghumo Firoo Travel Team</p>
        `;
        break;
      
      case 'role_update':
        subject = "Your Ghumo Firoo Travel CRM Role Has Been Updated";
        message = `
          <h1>Hi ${fullName}!</h1>
          <p>Your role in the Ghumo Firoo Travel CRM has been updated.</p>
          <p>New Role: ${role}</p>
          <p>Please log in to see your updated permissions and access.</p>
          <p>Best regards,<br>Ghumo Firoo Travel Team</p>
        `;
        break;
    }

    // Log the email details (in a real implementation, you would send via email service)
    console.log("Email notification:", { email, subject, message });

    // For now, we'll just log the email. In production, integrate with your email service
    // Example with Resend:
    /*
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const emailResponse = await resend.emails.send({
      from: "Ghumo Firoo Travel <notifications@ghumofiroo.com>",
      to: [email],
      subject: subject,
      html: message,
    });
    */

    return new Response(JSON.stringify({ success: true, message: "Notification sent" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-user-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
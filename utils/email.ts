"use server";

import {Resend} from "resend";

/**
 * Send email notification to user when mail is received
 */
export async function sendMailReceivedNotification(
  userEmail: string,
  userName: string,
  sender: string,
  mailItemId: string
): Promise<{success: boolean; message?: string}> {
  try {
    // Get the app URL for the mail item link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const mailItemUrl = `${appUrl}/app/inbox/${mailItemId}`;

    // Initialize Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY is not set. Email notification skipped.");
      return {success: false, message: "Email service not configured"};
    }

    const resend = new Resend(resendApiKey);

    // Get the from email address (should be a verified domain in Resend)
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "Keep PH <delivered@resend.dev>";

    // Create HTML email template
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Mail Received - Keep PH</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
              <h1 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Keep PH Digital Mailbox</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 20px; font-weight: 600;">New Mail Received</h2>
              
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.5;">
                Hello ${userName},
              </p>
              
              <p style="margin: 0 0 30px; color: #4a4a4a; font-size: 16px; line-height: 1.5;">
                You have received new mail from <strong>${sender}</strong>. You can view and manage this mail item in your digital mailbox.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center; padding: 20px 0;">
                    <a href="${mailItemUrl}" style="display: inline-block; padding: 14px 32px; background-color: #228be6; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">View Mail Item</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #8a8a8a; font-size: 14px; line-height: 1.5;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${mailItemUrl}" style="color: #228be6; text-decoration: none; word-break: break-all;">${mailItemUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-top: 1px solid #e0e0e0; text-align: center;">
              <p style="margin: 0 0 10px; color: #8a8a8a; font-size: 14px;">
                This is an automated notification from Keep PH Digital Mailbox.
              </p>
              <p style="margin: 0; color: #8a8a8a; font-size: 12px;">
                You can manage your email notification preferences in your account settings.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    // Send email via Resend
    const {data, error} = await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: "New Mail Received - Keep PH Digital Mailbox",
      html: emailHtml,
    });

    if (error) {
      console.error("Resend API error:", error);
      return {success: false, message: error.message || "Failed to send email"};
    }

    console.log("📧 Email notification sent successfully:", {
      emailId: data?.id,
      to: userEmail,
    });

    return {success: true};
  } catch (error) {
    console.error("Error sending email notification:", error);
    // Don't fail the mail creation if email fails
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to send email notification",
    };
  }
}

/**
 * Send email notification to user when their mail item scan is completed
 */
export async function sendScanCompletedNotification(
  userEmail: string,
  userName: string,
  sender: string,
  mailItemId: string
): Promise<{success: boolean; message?: string}> {
  try {
    // Get the app URL for the mail item link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const mailItemUrl = `${appUrl}/app/inbox/${mailItemId}`;

    // Initialize Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY is not set. Email notification skipped.");
      return {success: false, message: "Email service not configured"};
    }

    const resend = new Resend(resendApiKey);

    // Get the from email address (should be a verified domain in Resend)
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "Keep PH <delivered@resend.dev>";

    // Create HTML email template
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scan Completed - Keep PH</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
              <h1 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Keep PH Digital Mailbox</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 20px; font-weight: 600;">Document Scan Completed</h2>
              
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.5;">
                Hello ${userName},
              </p>
              
              <p style="margin: 0 0 30px; color: #4a4a4a; font-size: 16px; line-height: 1.5;">
                Your mail from <strong>${sender}</strong> has been scanned and is now available for viewing. You can access the full document scan in your digital mailbox.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center; padding: 20px 0;">
                    <a href="${mailItemUrl}" style="display: inline-block; padding: 14px 32px; background-color: #228be6; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">View Scanned Document</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #8a8a8a; font-size: 14px; line-height: 1.5;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${mailItemUrl}" style="color: #228be6; text-decoration: none; word-break: break-all;">${mailItemUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-top: 1px solid #e0e0e0; text-align: center;">
              <p style="margin: 0 0 10px; color: #8a8a8a; font-size: 14px;">
                This is an automated notification from Keep PH Digital Mailbox.
              </p>
              <p style="margin: 0; color: #8a8a8a; font-size: 12px;">
                You can manage your email notification preferences in your account settings.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    // Send email via Resend
    const {data, error} = await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: "Document Scan Completed - Keep PH Digital Mailbox",
      html: emailHtml,
    });

    if (error) {
      console.error("Resend API error:", error);
      return {success: false, message: error.message || "Failed to send email"};
    }

    console.log("📧 Scan completion email sent successfully:", {
      emailId: data?.id,
      to: userEmail,
    });

    return {success: true};
  } catch (error) {
    console.error("Error sending scan completion email:", error);
    // Don't fail the scan process if email fails
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to send email notification",
    };
  }
}

/**
 * Send email notification to user when their mail item is forwarded
 */
export async function sendForwardCompletedNotification(
  userEmail: string,
  userName: string,
  sender: string,
  mailItemId: string,
  forwardingAddress: string,
  trackingNumber: string,
  threePLName: string,
  trackingUrl: string | null
): Promise<{success: boolean; message?: string}> {
  try {
    // Get the app URL for the mail item link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const mailItemUrl = `${appUrl}/app/inbox/${mailItemId}`;

    // Initialize Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY is not set. Email notification skipped.");
      return {success: false, message: "Email service not configured"};
    }

    const resend = new Resend(resendApiKey);

    // Get the from email address (should be a verified domain in Resend)
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "Keep PH <delivered@resend.dev>";

    // Build tracking section HTML
    const trackingSection = trackingUrl
      ? `
              <p style="margin: 0 0 10px; color: #4a4a4a; font-size: 16px; line-height: 1.5;">
                <strong>Tracking Number:</strong> ${trackingNumber}
              </p>
              <p style="margin: 0 0 10px; color: #4a4a4a; font-size: 16px; line-height: 1.5;">
                <strong>3PL Provider:</strong> ${threePLName}
              </p>
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.5;">
                <strong>Track Your Shipment:</strong><br>
                <a href="${trackingUrl}" style="color: #228be6; text-decoration: none; word-break: break-all;">${trackingUrl}</a>
              </p>
      `
      : `
              <p style="margin: 0 0 10px; color: #4a4a4a; font-size: 16px; line-height: 1.5;">
                <strong>Tracking Number:</strong> ${trackingNumber}
              </p>
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.5;">
                <strong>3PL Provider:</strong> ${threePLName}
              </p>
      `;

    // Create HTML email template
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mail Forwarded - Keep PH</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
              <h1 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Keep PH Digital Mailbox</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 20px; font-weight: 600;">Mail Forwarded</h2>
              
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.5;">
                Hello ${userName},
              </p>
              
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.5;">
                Your mail from <strong>${sender}</strong> has been forwarded to your specified address and is now in transit.
              </p>
              
              <!-- Forwarding Details -->
              <div style="background-color: #f9f9f9; border-left: 4px solid #228be6; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px; color: #4a4a4a; font-size: 16px; line-height: 1.5;">
                  <strong>Forwarding Address:</strong><br>
                  ${forwardingAddress}
                </p>
                ${trackingSection}
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center; padding: 20px 0;">
                    <a href="${mailItemUrl}" style="display: inline-block; padding: 14px 32px; background-color: #228be6; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">View Mail Item</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #8a8a8a; font-size: 14px; line-height: 1.5;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${mailItemUrl}" style="color: #228be6; text-decoration: none; word-break: break-all;">${mailItemUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-top: 1px solid #e0e0e0; text-align: center;">
              <p style="margin: 0 0 10px; color: #8a8a8a; font-size: 14px;">
                This is an automated notification from Keep PH Digital Mailbox.
              </p>
              <p style="margin: 0; color: #8a8a8a; font-size: 12px;">
                You can manage your email notification preferences in your account settings.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    // Send email via Resend
    const {data, error} = await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: "Mail Forwarded - Keep PH Digital Mailbox",
      html: emailHtml,
    });

    if (error) {
      console.error("Resend API error:", error);
      return {success: false, message: error.message || "Failed to send email"};
    }

    console.log("📧 Forward completion email sent successfully:", {
      emailId: data?.id,
      to: userEmail,
    });

    return {success: true};
  } catch (error) {
    console.error("Error sending forward completion email:", error);
    // Don't fail the forward process if email fails
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to send email notification",
    };
  }
}

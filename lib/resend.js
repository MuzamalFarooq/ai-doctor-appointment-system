import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAppointmentConfirmation({ to, patientName, doctorName, date, time, appointmentId }) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@mediconnect.muzamal.site',
    to,
    subject: 'Appointment Request Received — MediConnect AI',
    html: `
      <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #1d7ceb, #cc45f1); padding: 32px; border-radius: 16px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Request Received</h1>
        </div>
        <div style="background: white; padding: 32px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <p style="font-size: 16px; color: #374151;">Dear <strong>${patientName}</strong>,</p>
          <p style="color: #6b7280;">Your appointment request has been received and is pending confirmation by the provider.</p>
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 8px 0; color: #0369a1;"><strong>Doctor:</strong> ${doctorName}</p>
            <p style="margin: 8px 0; color: #0369a1;"><strong>Date:</strong> ${date}</p>
            <p style="margin: 8px 0; color: #0369a1;"><strong>Time:</strong> ${time}</p>
            <p style="margin: 8px 0; color: #0369a1;"><strong>Ref ID:</strong> ${appointmentId}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Please wait for the provider to confirm your appointment before making arrangements to attend.</p>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">MediConnect AI — Smarter Healthcare</p>
      </div>
    `,
  });
}

export async function sendAppointmentReminder({ to, patientName, doctorName, date, time }) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@mediconnect.muzamal.site',
    to,
    subject: 'Appointment Reminder — Tomorrow',
    html: `
      <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reminder: Your appointment is tomorrow!</h2>
        <p>Doctor: ${doctorName}</p>
        <p>Date: ${date}</p>
        <p>Time: ${time}</p>
      </div>
    `,
  });
}

/**
 * Send branded password reset email with secure one-time link.
 */
export async function sendPasswordResetEmail({ to, resetUrl, userName }) {
  const fromEmail = process.env.EMAIL_FROM || 'noreply@mediconnect.muzamal.site';
  const displayName = userName ? `Hello ${userName},` : 'Hello,';

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject: 'Reset Your Password — MediConnect AI',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f1f5f9;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #1e293b; border: 1px solid #334155; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 36px 32px 24px 32px; text-align: center; background: linear-gradient(135deg, rgba(29, 124, 235, 0.15), rgba(204, 69, 241, 0.15)); border-bottom: 1px solid #334155;">
                      <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background: linear-gradient(135deg, #1d7ceb, #cc45f1); color: #ffffff; font-size: 24px; font-weight: bold; margin-bottom: 12px;">
                        +
                      </div>
                      <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">MediConnect AI</h1>
                      <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">Smart Healthcare & Clinical Appointments</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 32px;">
                      <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #ffffff;">Password Reset Request</h2>
                      <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 24px; color: #cbd5e1;">${displayName}</p>
                      <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 24px; color: #cbd5e1;">
                        We received a request to reset the password for your MediConnect AI account. Click the button below to securely create a new password:
                      </p>

                      <!-- Action Button -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #1d7ceb, #cc45f1); color: #ffffff; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 14px rgba(29, 124, 235, 0.4);">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>

                      <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; margin: 24px 0;">
                        <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #f59e0b;">⏳ Important Security Notice</p>
                        <p style="margin: 0; font-size: 12px; line-height: 18px; color: #94a3b8;">
                          This reset link expires in <strong>30 minutes</strong> and can only be used once. If you did not request this reset, you can safely ignore this email. Your current password will remain unchanged.
                        </p>
                      </div>

                      <p style="margin: 20px 0 8px 0; font-size: 12px; color: #64748b;">
                        If the button above does not work, copy and paste this URL into your browser:
                      </p>
                      <p style="margin: 0; font-size: 11px; word-break: break-all; color: #38bdf8;">
                        <a href="${resetUrl}" style="color: #38bdf8; text-decoration: underline;">${resetUrl}</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 32px; background-color: #0f172a; border-top: 1px solid #334155; text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #64748b;">
                        © ${new Date().getFullYear()} MediConnect AI. All rights reserved.
                      </p>
                      <p style="margin: 6px 0 0 0; font-size: 11px; color: #475569;">
                        This is an automated system notification. Please do not reply directly to this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error('Password reset email dispatch failure:', {
      name: error?.name || 'EmailError',
      message: error?.message || 'Failed to send reset email',
    });
    return { success: false, error };
  }
}

/**
 * Send branded confirmation email after password has been successfully reset.
 */
export async function sendPasswordResetSuccessEmail({ to, userName }) {
  const fromEmail = process.env.EMAIL_FROM || 'noreply@mediconnect.muzamal.site';
  const displayName = userName ? `Hello ${userName},` : 'Hello,';
  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://mediconnect.muzamal.site';

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject: 'Password Changed Successfully — MediConnect AI',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Changed</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f1f5f9;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #1e293b; border: 1px solid #334155; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 36px 32px 24px 32px; text-align: center; background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(29, 124, 235, 0.15)); border-bottom: 1px solid #334155;">
                      <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background: #10b981; color: #ffffff; font-size: 24px; font-weight: bold; margin-bottom: 12px;">
                        ✓
                      </div>
                      <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff;">Password Changed</h1>
                      <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">MediConnect AI Security Alert</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 32px;">
                      <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 24px; color: #cbd5e1;">${displayName}</p>
                      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 24px; color: #cbd5e1;">
                        The password for your MediConnect AI account was successfully updated on <strong>${new Date().toUTCString()}</strong>.
                      </p>

                      <div style="background-color: #0f172a; border: 1px solid #ef4444; border-radius: 12px; padding: 16px; margin: 24px 0;">
                        <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #ef4444;">Did not make this change?</p>
                        <p style="margin: 0; font-size: 12px; line-height: 18px; color: #cbd5e1;">
                          If you did not initiate this password change, please contact our support team immediately or request another reset to protect your medical account.
                        </p>
                      </div>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0 12px 0;">
                        <tr>
                          <td align="center">
                            <a href="${appUrl}/login" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #1d7ceb; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; text-decoration: none;">
                              Sign In to Your Account
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 32px; background-color: #0f172a; border-top: 1px solid #334155; text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #64748b;">
                        © ${new Date().getFullYear()} MediConnect AI. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error('Password reset success email dispatch failure:', {
      name: error?.name || 'EmailError',
      message: error?.message || 'Failed to send confirmation email',
    });
    return { success: false, error };
  }
}

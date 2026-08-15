import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAppointmentConfirmation({ to, patientName, doctorName, date, time, appointmentId }) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@mediconnect.ai',
    to,
    subject: 'Appointment Confirmed — MediConnect AI',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #1d7ceb, #cc45f1); padding: 32px; border-radius: 16px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Appointment Confirmed! ✅</h1>
        </div>
        <div style="background: white; padding: 32px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <p style="font-size: 16px; color: #374151;">Dear <strong>${patientName}</strong>,</p>
          <p style="color: #6b7280;">Your appointment has been successfully confirmed.</p>
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 8px 0; color: #0369a1;"><strong>Doctor:</strong> ${doctorName}</p>
            <p style="margin: 8px 0; color: #0369a1;"><strong>Date:</strong> ${date}</p>
            <p style="margin: 8px 0; color: #0369a1;"><strong>Time:</strong> ${time}</p>
            <p style="margin: 8px 0; color: #0369a1;"><strong>Ref ID:</strong> ${appointmentId}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Please arrive 10 minutes before your appointment. Carry any previous medical records.</p>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">MediConnect AI — Smarter Healthcare</p>
      </div>
    `,
  });
}

export async function sendAppointmentReminder({ to, patientName, doctorName, date, time }) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@mediconnect.ai',
    to,
    subject: 'Appointment Reminder — Tomorrow',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reminder: Your appointment is tomorrow!</h2>
        <p>Doctor: ${doctorName}</p>
        <p>Date: ${date}</p>
        <p>Time: ${time}</p>
      </div>
    `,
  });
}

export async function sendPasswordReset({ to, resetLink }) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@mediconnect.ai',
    to,
    subject: 'Reset Your Password — MediConnect AI',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
        <div style="background: white; padding: 32px; border-radius: 16px;">
          <h2 style="color: #1d7ceb;">Reset Your Password</h2>
          <p>Click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #1d7ceb, #cc45f1); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">Reset Password</a>
          <p style="color: #6b7280; font-size: 14px;">If you did not request this, please ignore this email.</p>
        </div>
      </div>
    `,
  });
}

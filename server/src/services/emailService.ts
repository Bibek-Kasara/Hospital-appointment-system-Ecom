import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter: nodemailer.Transporter | null = null;

const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (transporter) return transporter;

  if (env.smtp.host && env.smtp.user) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('Using Ethereal test SMTP:', testAccount.user);
  }

  return transporter;
};

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
): Promise<{ sent: boolean; previewUrl?: string }> => {
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: env.smtp.user || '"Sahid Hospital" <noreply@sahidhospital.gov.np>',
      to,
      subject,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    if (previewUrl) {
      console.log('Email preview URL:', previewUrl);
    }

    return { sent: true, previewUrl };
  } catch (error) {
    console.error('Email send error:', error);
    return { sent: false };
  }
};

export const buildAppointmentEmail = (
  type: 'booking' | 'cancellation' | 'reschedule',
  details: {
    patientName: string;
    doctorName: string;
    date: string;
    time: string;
    department?: string;
  },
): { subject: string; html: string } => {
  const subjects = {
    booking: 'Appointment Confirmation - Sahid Hospital',
    cancellation: 'Appointment Cancelled - Sahid Hospital',
    reschedule: 'Appointment Rescheduled - Sahid Hospital',
  };

  const messages = {
    booking: `Your appointment has been confirmed.`,
    cancellation: `Your appointment has been cancelled.`,
    reschedule: `Your appointment has been rescheduled.`,
  };

  return {
    subject: subjects[type],
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Sahid Hospital</h2>
        <p>Dear ${details.patientName},</p>
        <p>${messages[type]}</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Doctor:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${details.doctorName}</td></tr>
          ${details.department ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Department:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${details.department}</td></tr>` : ''}
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Date:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${details.date}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Time:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${details.time}</td></tr>
        </table>
        <p>Please arrive 15 minutes before your scheduled time.</p>
        <p style="color: #666; font-size: 12px;">This is an automated message from Sahid Hospital Appointment System.</p>
      </div>
    `,
  };
};

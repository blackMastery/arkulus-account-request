/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';

export default async function handler(
  req: { body: any; method: any },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: {
        (arg0: { success: boolean; data?: SentMessageInfo; error?: any }): void;
        new (): any;
      };
      end: { (arg0: string): void; new (): any };
    };
    setHeader: (arg0: string, arg1: string[]) => void;
  },
) {
  const { body, method } = req;

  if (method === 'POST') {
    // Validate environment variables
    const emailUsername = process.env.EMAIL_USERNAME;
    const emailPassword = process.env.EMAIL_PASSWORD;

    if (!emailUsername || !emailPassword) {
      return res.status(500).json({
        success: false,
        error:
          'Email configuration is missing. Please set EMAIL_USERNAME and EMAIL_PASSWORD in your .env file.',
      });
    }

    // Normalize email address - if username already includes @, use it as-is, otherwise append @gmail.com
    const normalizeEmail = (username: string): string => {
      if (username.includes('@')) {
        return username;
      }
      return `${username}@gmail.com`;
    };

    const fromEmail = normalizeEmail(emailUsername);
    const toEmail = normalizeEmail(emailUsername);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: fromEmail,
        pass: emailPassword,
      },
    });

    const mailOptions = {
      from: `"Your Company" <${fromEmail}>`,
      to: toEmail,
      subject: body.subject,
      text: body.text,
    };

    try {
      // Verify connection configuration
      await transporter.verify();
      const emailRes = await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, data: emailRes });
    } catch (error: any) {
      console.error('Email error:', error);

      // Provide more helpful error messages
      let errorMessage = 'Failed to send email';
      if (error.code === 'EAUTH') {
        errorMessage =
          'Authentication failed. Please check your EMAIL_USERNAME and EMAIL_PASSWORD. For Gmail, you must use an app-specific password (not your regular password). Generate one at: https://myaccount.google.com/apppasswords';
      } else if (error.message) {
        errorMessage = error.message;
      }

      res.status(500).json({ success: false, error: errorMessage });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}

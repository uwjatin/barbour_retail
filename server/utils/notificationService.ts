// server/utils/notificationService.ts
import twilio from 'twilio';
import nodemailer from 'nodemailer';

// Twilio client initialization
let twilioClient: any = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('Twilio client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Twilio client:', error);
  }
}

// Email transporter initialization
let emailTransporter: any = null;

if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  try {
    emailTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    
    // Test connection
    emailTransporter.verify((error: any, success: boolean) => {
      if (error) {
        console.error('Email transporter verification failed:', error);
      } else {
        console.log('Email transporter initialized successfully');
      }
    });
  } catch (error) {
    console.error('Failed to initialize email transporter:', error);
  }
}

export interface SendSmsOptions {
  to: string;
  message: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
}

export async function sendSms(options: SendSmsOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Check if using mock mode
  if (process.env.NOTIFICATION_MODE === 'mock') {
    console.log('[MOCK SMS] To:', options.to, 'Message:', options.message);
    return { 
      success: true, 
      messageId: `mock_sms_${Date.now()}` 
    };
  }

  if (!twilioClient) {
    return {
      success: false,
      error: 'Twilio not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env'
    };
  }

  try {
    // Ensure phone number format
    let toNumber = options.to.replace(/\s/g, '');
    if (!toNumber.startsWith('+')) {
      toNumber = '+33' + toNumber; // Default to French number if no country code
    }

    const message = await twilioClient.messages.create({
      body: options.message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toNumber,
    });

    console.log('SMS sent successfully:', message.sid);
    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error.message || 'Failed to send SMS',
    };
  }
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Check if using mock mode
  if (process.env.NOTIFICATION_MODE === 'mock') {
    console.log('[MOCK EMAIL] To:', options.to, 'Subject:', options.subject, 'Message:', options.body);
    return { 
      success: true, 
      messageId: `mock_email_${Date.now()}` 
    };
  }

  if (!emailTransporter) {
    return {
      success: false,
      error: 'Email not configured. Please set EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD in .env'
    };
  }

  try {
    const info = await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || `"Style Anglais" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.body,
      html: options.body.replace(/\n/g, '<br>'),
    });

    console.log('Email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

export async function sendNotification(
  type: 'SMS' | 'EMAIL',
  recipient: string,
  content: string,
  subject?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (type === 'SMS') {
    return sendSms({
      to: recipient,
      message: content,
    });
  } else if (type === 'EMAIL') {
    return sendEmail({
      to: recipient,
      subject: subject || 'Notification Style Anglais',
      body: content,
    });
  }
  
  return {
    success: false,
    error: 'Invalid notification type'
  };
}

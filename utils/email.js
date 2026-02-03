const nodemailer = require('nodemailer');

// Initialize email transporter
let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * Send email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @param {string} text - Email text content (fallback)
 */
async function sendEmail(to, subject, html, text = '') {
  try {
    if (!transporter) {
      console.warn('Email transporter not configured. Skipping email send.');
      console.log(`Email to: ${to}, Subject: ${subject}`); // Log for testing
      return;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML if no text provided
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully. MessageID: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send order confirmation email
 * @param {string} email - Customer email
 * @param {object} order - Order object
 * @param {string} language - Language preference ('ar' or 'en')
 */
async function sendOrderConfirmationEmail(email, order, language = 'en') {
  const templates = {
    en: {
      subject: `Order Confirmation #${order.orderId}`,
      html: `
        <h2>Order Confirmation</h2>
        <p>Thank you for your order!</p>
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
        <p>We will start working on your order soon.</p>
      `
    },
    ar: {
      subject: `تأكيد الطلب #${order.orderId}`,
      html: `
        <h2>تأكيد الطلب</h2>
        <p>شكراً لطلبك!</p>
        <p><strong>رقم الطلب:</strong> ${order.orderId}</p>
        <p><strong>المبلغ الإجمالي:</strong> $${order.totalAmount}</p>
        <p>سنبدأ العمل على طلبك قريباً.</p>
      `
    }
  };

  const template = templates[language] || templates.en;
  return sendEmail(email, template.subject, template.html);
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetLink - Reset link
 * @param {string} language - Language preference ('ar' or 'en')
 */
async function sendPasswordResetEmail(email, resetLink, language = 'en') {
  const templates = {
    en: {
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
      `
    },
    ar: {
      subject: 'طلب إعادة تعيين كلمة المرور',
      html: `
        <h2>إعادة تعيين كلمة المرور</h2>
        <p>لقد طلبت إعادة تعيين كلمة المرور. انقر على الرابط أدناه لإعادة تعيين كلمة المرور:</p>
        <a href="${resetLink}">إعادة تعيين كلمة المرور</a>
        <p>ينتهي هذا الرابط في غضون ساعة واحدة.</p>
      `
    }
  };

  const template = templates[language] || templates.en;
  return sendEmail(email, template.subject, template.html);
}

module.exports = {
  sendEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail
};

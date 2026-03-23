const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

const getEmailTemplate = (content, title) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #F4F7F9;
          margin: 0;
          padding: 0;
          color: #1C1C1C;
        }
        .wrapper {
          width: 100%;
          table-layout: fixed;
          background-color: #F4F7F9;
          padding-bottom: 40px;
        }
        .main-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
          margin-top: 40px;
          border-top: 6px solid #C8102E;
        }
        .header {
          background-color: #121212;
          padding: 40px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 32px;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 4px;
          font-style: italic;
        }
        .header p {
          color: #C8102E;
          margin-top: 10px;
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .content {
          padding: 50px 40px;
          line-height: 1.8;
          font-size: 16px;
          color: #333333;
        }
        .content h2 {
          font-family: 'Playfair Display', serif;
          color: #121212;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .footer {
          background-color: #121212;
          color: #94A3B8;
          padding: 40px 20px;
          text-align: center;
          font-size: 13px;
        }
        .social-links {
          margin-bottom: 25px;
        }
        .social-links a {
          margin: 0 10px;
          color: #ffffff;
          text-decoration: none;
        }
        .btn-container {
          text-align: center;
          margin: 35px 0;
        }
        .btn {
          display: inline-block;
          background-color: #C8102E;
          color: #ffffff !important;
          padding: 16px 35px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(200, 16, 46, 0.2);
        }
        .divider {
          height: 1px;
          background-color: #EAEAEA;
          margin: 30px 0;
        }
        .accent {
          color: #C8102E;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="main-container">
          <div class="header">
            <h1>NexoraNews</h1>
            <p>Intelligence & Impact</p>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <div class="social-links">
              <a href="#">Facebook</a> | <a href="#">Twitter</a> | <a href="#">Instagram</a> | <a href="#">LinkedIn</a>
            </div>
            <p style="color: #ffffff; font-weight: bold; margin-bottom: 10px;">NexoraNews Media Group</p>
            <p>&copy; ${new Date().getFullYear()} All rights reserved.</p>
            <p style="margin-top: 15px; font-size: 11px; opacity: 0.6;">You are receiving this because you subscribed to NexoraNews. <br/> 123 News Plaza, Manhattan, NY 10001</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

exports.sendSubscriptionEmail = async (email) => {
  const content = `
    <h2>Welcome to the Inner Circle.</h2>
    <p>Thank you for joining <span class="accent">NexoraNews</span>. You are now part of an exclusive group of readers who value deep-dive analysis, breaking news, and premium insights.</p>
    <p>Expect your first briefing in your inbox shortly. We cover everything from global politics to the frontiers of technology.</p>
    <div class="btn-container">
      <a href="${process.env.FRONTEND_URL}" class="btn">Explore Top Stories</a>
    </div>
    <div class="divider"></div>
    <p style="font-size: 13px; color: #666;">If you believe this was a mistake, no action is needed. You can unsubscribe at the bottom of any future email.</p>
  `;
  
  await sendEmail({
    email,
    subject: 'Welcome to NexoraNews | Daily Briefing Subscribed',
    html: getEmailTemplate(content, 'Welcome to NexoraNews'),
  });
};

exports.sendResetPasswordEmail = async (email, resetUrl) => {
  const content = `
    <h2>Security Notification: Password Reset</h2>
    <p>We received a request to reset the password for the NexoraNews account associated with <span class="accent">${email}</span>.</p>
    <p>To ensure the security of your account, please use the button below to set a new password. This link will remain active for <span class="accent">10 minutes</span>.</p>
    <div class="btn-container">
      <a href="${resetUrl}" class="btn">Reset My Password</a>
    </div>
    <div class="divider"></div>
    <p style="font-size: 13px; color: #666; font-style: italic;">If you did not initiate this request, please ignore this email or contact our support team immediately if you have concerns about your account security.</p>
  `;

  await sendEmail({
    email,
    subject: 'Action Required: Password Reset for NexoraNews',
    html: getEmailTemplate(content, 'Reset Your Password'),
  });
};

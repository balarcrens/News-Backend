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

const getEmailTemplate = (content, previewText) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Nexora News | Intelligence & Impact</title>
      <style>
        /* RESET STYLES */
        body { margin: 0; padding: 0; min-width: 100%; width: 100% !important; height: 100% !important; background-color: #F8FAFC; }
        table { border-spacing: 0; border-collapse: collapse; width: 100%; }
        td { padding: 0; }
        img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
        
        /* FONTS - Fallbacks to Serif/Sans-serif */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Playfair+Display:ital,wght@0,900;1,900&display=swap');
        
        .main-body {
          font-family: 'Inter', Helvetica, Arial, sans-serif;
          color: #1A1A1A;
          line-height: 1.6;
        }

        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
          margin-top: 40px;
          margin-bottom: 40px;
          border: 1px solid #E2E8F0;
        }

        .header {
          background-color: #0F172A;
          padding: 60px 40px;
          text-align: center;
          position: relative;
        }

        .header-logo {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 38px;
          font-weight: 900;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: -1px;
          font-style: italic;
          margin-bottom: 8px;
          display: block;
        }

        .header-tagline {
          color: #EF4444;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin: 0;
        }

        .content {
          padding: 60px 50px;
        }

        .content h2 {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 900;
          color: #0F172A;
          margin-top: 0;
          margin-bottom: 24px;
          line-height: 1.1;
        }

        .content p {
          font-size: 16px;
          color: #475569;
          margin-bottom: 24px;
        }

        .btn-wrapper {
          text-align: center;
          margin: 48px 0;
        }

        .btn {
          display: inline-block;
          background-color: #C8102E;
          color: #ffffff !important;
          padding: 20px 48px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 13px;
          transition: all 0.3s ease;
        }

        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #E2E8F0, transparent);
          margin: 40px 0;
        }

        .footer {
          background-color: #F8FAFC;
          padding: 50px 40px;
          text-align: center;
          border-top: 1px solid #E2E8F0;
        }

        .footer p {
          font-size: 12px;
          color: #94A3B8;
          margin: 8px 0;
          line-height: 1.5;
        }

        .social-icons {
          margin-bottom: 24px;
        }

        .social-icons a {
          color: #0F172A;
          text-decoration: none;
          margin: 0 12px;
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .accent-text {
          color: #C8102E;
          font-weight: 700;
        }

        /* PREVIEW TEXT HACK */
        .preview-text { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; }

        @media screen and (max-width: 600px) {
          .container { margin-top: 0; margin-bottom: 0; border-radius: 0; border: none; }
          .content { padding: 40px 25px; }
          .header { padding: 40px 20px; }
          .content h2 { font-size: 28px; }
        }
      </style>
    </head>
    <body class="main-body">
      <div class="preview-text">${previewText}</div>
      <table role="presentation">
        <tr>
          <td align="center">
            <div class="container">
              <div class="header">
                <span class="header-logo">NexoraNews</span>
                <p class="header-tagline">Intelligence & Impact</p>
              </div>
              <div class="content">
                ${content}
              </div>
              <div class="footer">
                <div class="social-icons">
                  <a href="https://x.com/Nexora_News">Twitter</a>
                  <a href="https://www.linkedin.com/in/nexora-news/">LinkedIn</a>
                  <a href="#">Instagram</a>
                </div>
                <p><strong>NexoraNews Media Group</strong></p>
                <p>&copy; ${new Date().getFullYear()} All Rights Reserved.</p>
                <p style="margin-top: 20px; opacity: 0.6;">
                  This is a high-priority communication from NexoraNews. <br />
                  You are receiving this because you are part of our verified network.
                </p>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

exports.sendSubscriptionEmail = async (email) => {
    const content = `
    <h2>Welcome to the <br/><span class="accent-text">Inner Circle.</span></h2>
    <p>We are delighted to confirm your inclusion in the NexoraNews briefing network. You have joined an elite group of readers who demand more than just headlines.</p>
    <p>Starting tomorrow, you will receive our <strong>Daily Intelligence Brief</strong>—a curated synthesis of the global events moving the needle in politics, high-tech, and culture.</p>
    <div class="btn-wrapper">
      <a href="${process.env.FRONTEND_URL || 'https://nexora.news'}" class="btn">Access Top Stories</a>
    </div>
    <div class="divider"></div>
    <p style="font-size: 13px; font-style: italic;">"Intelligence is not just knowing what happened, but understanding why it matters."</p>
  `;

    const previewText = "Welcome to the premium NexoraNews briefing network. Your daily intelligence starts now.";

    await sendEmail({
        email,
        subject: 'Confirmed: Your Admission to NexoraNews Inner Circle',
        html: getEmailTemplate(content, previewText),
    });
};

exports.sendResetPasswordEmail = async (email, resetUrl) => {
    const content = `
    <h2>Security Action <br/><span class="accent-text">Required.</span></h2>
    <p>A high-priority request was initiated to reset the password for the NexoraNews profile associated with <strong style="color:#0F172A">${email}</strong>.</p>
    <p>To ensure the continued integrity of your account, please establish your new credentials using the secure portal below. This authorization link is valid for <span class="accent-text">10 minutes</span>.</p>
    <div class="btn-wrapper">
      <a href="${resetUrl}" class="btn">Reset My Credentials</a>
    </div>
    <div class="divider"></div>
    <p style="font-size: 13px; color: #64748B;">If you did not authorize this request, please disregard this transmission or contact our security desk immediately.</p>
  `;

    const previewText = "Security notification: Use the secure link inside to establish your new NexoraNews credentials.";

    await sendEmail({
        email,
        subject: 'Reset Your NexoraNews Access Credentials',
        html: getEmailTemplate(content, previewText),
    });
};

// server.js - GoDaddy Business Email with Detailed Error Logging
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ============================================
// DETAILED LOGGING FUNCTION
// ============================================
function logError(error, step, additionalInfo = {}) {
  console.log('\n' + '='.repeat(60));
  console.log(`❌ ERROR AT STEP: ${step}`);
  console.log('='.repeat(60));
  console.log(`Time: ${new Date().toLocaleString()}`);
  console.log(`Error Code: ${error.code || 'N/A'}`);
  console.log(`Error Message: ${error.message || error}`);
  console.log(`Error Command: ${error.command || 'N/A'}`);
  console.log(`Error Response: ${error.response || 'N/A'}`);
  
  if (error.responseCode) {
    console.log(`Response Code: ${error.responseCode}`);
  }
  
  console.log('\n📋 Additional Info:');
  Object.keys(additionalInfo).forEach(key => {
    console.log(`   ${key}: ${additionalInfo[key]}`);
  });
  
  console.log('\n🔧 Stack Trace:');
  console.log(error.stack || 'No stack trace available');
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message, data = {}) {
  console.log('\n' + '='.repeat(60));
  console.log(`✅ ${message}`);
  console.log('='.repeat(60));
  Object.keys(data).forEach(key => {
    console.log(`   ${key}: ${data[key]}`);
  });
  console.log('='.repeat(60) + '\n');
}

// ============================================
// BEAUTIFUL EMAIL TEMPLATE
// ============================================
function createBeautifulEmail(firstName, lastName, email, subject, message, date) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact - KJ's Fashion</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'Montserrat', sans-serif;
          background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
          padding: 40px 20px;
        }
        
        .email-container {
          max-width: 650px;
          margin: 0 auto;
          background: #fdf8f0;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.3);
        }
        
        .email-header {
          background: linear-gradient(135deg, #0a0e27 0%, #16213e 100%);
          padding: 50px 30px 40px;
          text-align: center;
        }
        
        .logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 56px;
          font-weight: 700;
          color: #fdf8f0;
          letter-spacing: 4px;
        }
        
        .logo-sub {
          font-size: 12px;
          letter-spacing: 8px;
          color: #d4af7a;
          display: block;
          margin-top: 8px;
        }
        
        .header-badge {
          display: inline-block;
          background: rgba(212, 175, 106, 0.15);
          border: 1px solid #d4af7a;
          border-radius: 50px;
          padding: 8px 24px;
          margin-top: 25px;
          font-size: 12px;
          color: #d4af7a;
        }
        
        .header-title {
          font-size: 28px;
          color: #fdf8f0;
          margin-top: 25px;
          font-family: 'Cormorant Garamond', serif;
        }
        
        .header-date {
          color: #d4af7a;
          font-size: 13px;
          margin-top: 10px;
        }
        
        .email-content {
          padding: 45px 40px;
          background: #fdf8f0;
        }
        
        .greeting {
          font-size: 28px;
          color: #0a0e27;
          font-family: 'Cormorant Garamond', serif;
          margin-bottom: 30px;
          border-left: 4px solid #d4af7a;
          padding-left: 20px;
        }
        
        .info-card {
          background: white;
          border-radius: 20px;
          padding: 25px 30px;
          margin: 30px 0;
          box-shadow: 0 5px 20px rgba(0,0,0,0.05);
          border: 1px solid #f0e5d8;
        }
        
        .info-row {
          display: flex;
          padding: 14px 0;
          border-bottom: 1px solid #f0e5d8;
        }
        
        .info-row:last-child { border-bottom: none; }
        
        .info-label {
          width: 110px;
          font-weight: 600;
          color: #0a0e27;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        
        .info-value {
          flex: 1;
          color: #4a4a4a;
          font-size: 14px;
        }
        
        .info-value a { color: #d4af7a; text-decoration: none; }
        
        .message-box {
          background: #fdf8f0;
          border: 2px solid #f0e5d8;
          border-radius: 20px;
          padding: 25px 30px;
          margin: 30px 0;
        }
        
        .message-label {
          color: #d4af7a;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 3px;
          font-weight: 600;
          margin-bottom: 15px;
        }
        
        .message-text {
          color: #2c2c2c;
          line-height: 1.8;
          font-size: 15px;
          white-space: pre-wrap;
        }
        
        .action-buttons { text-align: center; margin: 35px 0 20px; }
        
        .btn-reply {
          display: inline-block;
          background: linear-gradient(135deg, #0a0e27, #16213e);
          color: #fdf8f0;
          padding: 14px 35px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        
        .btn-reply:hover { transform: translateY(-2px); }
        
        .email-footer {
          background: linear-gradient(135deg, #0a0e27 0%, #16213e 100%);
          padding: 35px 30px;
          text-align: center;
        }
        
        .footer-text { color: #8a8a8a; font-size: 12px; line-height: 1.8; }
        .footer-text strong { color: #d4af7a; }
        
        @media (max-width: 600px) {
          .email-content { padding: 30px 20px; }
          .info-row { flex-direction: column; }
          .info-label { width: 100%; margin-bottom: 5px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <div class="logo">KJ's<span class="logo-sub">FASHION</span></div>
          <div class="header-badge">✨ NEW MESSAGE RECEIVED</div>
          <div class="header-title">Contact Form Submission</div>
          <div class="header-date">${date}</div>
        </div>
        
        <div class="email-content">
          <div class="greeting">Dear KJ's Fashion Team,</div>
          
          <div class="info-card">
            <div class="info-row"><div class="info-label">👤 FROM</div><div class="info-value">${firstName} ${lastName}</div></div>
            <div class="info-row"><div class="info-label">📧 EMAIL</div><div class="info-value"><a href="mailto:${email}">${email}</a></div></div>
            <div class="info-row"><div class="info-label">📌 SUBJECT</div><div class="info-value"><strong>${subject}</strong></div></div>
            <div class="info-row"><div class="info-label">⏰ TIME</div><div class="info-value">${date}</div></div>
          </div>
          
          <div class="message-box">
            <div class="message-label">💬 MESSAGE</div>
            <div class="message-text">${message.replace(/\n/g, '<br>')}</div>
          </div>
          
          <div class="action-buttons">
            <a href="mailto:${email}" class="btn-reply">✉️ Reply to ${firstName}</a>
          </div>
        </div>
        
        <div class="email-footer">
          <div class="footer-text">
            <strong>KJ's Fashion</strong><br>
            123 Luxury Avenue, Fashion District<br>
            <small>info@kjfashion.com</small>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API server is running!',
    email: process.env.EMAIL_USER || 'Not configured',
    nodeEnv: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// CONTACT ENDPOINT - GOOGLE DNS WORKAROUND
// ============================================
app.post('/api/contact', async (req, res) => {
  console.log('\n📨 ===== NEW CONTACT FORM SUBMISSION =====');
  console.log(`Time: ${new Date().toLocaleString()}`);
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { firstName, lastName, email, subject, message } = req.body;
    
    // Validation
    const errors = [];
    if (!firstName?.trim()) errors.push('First name is required');
    if (!lastName?.trim()) errors.push('Last name is required');
    if (!email?.trim()) errors.push('Email is required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Invalid email format');
    if (!subject) errors.push('Subject is required');
    if (!message?.trim()) errors.push('Message is required');
    
    if (errors.length > 0) {
      logError({ message: errors.join(', ') }, 'Validation', { errors });
      return res.status(400).json({ success: false, error: errors.join('. ') });
    }
    
    // Check credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      const error = new Error('Missing EMAIL_USER or EMAIL_PASS in .env file');
      logError(error, 'Environment Check', { 
        EMAIL_USER_EXISTS: !!process.env.EMAIL_USER,
        EMAIL_PASS_EXISTS: !!process.env.EMAIL_PASS
      });
      return res.status(500).json({ 
        success: false, 
        error: 'Email service not configured. Please check server configuration.' 
      });
    }
    
    logSuccess('Credentials found', {
      Email: process.env.EMAIL_USER,
      HasPassword: 'Yes'
    });
    
    // ============================================
    // METHOD 1: GoDaddy SMTP Relay (localhost - No Auth)
    // ============================================
    console.log('\n🔧 Attempt 1: GoDaddy SMTP Relay (localhost:25)');
    
    const configs = [
      // Config 1: Localhost SMTP Relay (Best for GoDaddy)
      {
        name: 'GoDaddy Local Relay',
        host: 'localhost',
        port: 25,
        secure: false,
        auth: false,
        tls: { rejectUnauthorized: false }
      },
      // Config 2: GoDaddy SSL Port 465
      {
        name: 'GoDaddy SSL',
        host: 'smtpout.secureserver.net',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: { rejectUnauthorized: false }
      },
      // Config 3: GoDaddy TLS Port 587
      {
        name: 'GoDaddy TLS',
        host: 'smtpout.secureserver.net',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: { rejectUnauthorized: false }
      },
      // Config 4: Direct SMTP (mail.yourdomain.com)
      {
        name: 'Direct Domain SMTP',
        host: `mail.${process.env.EMAIL_USER.split('@')[1]}`,
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      }
    ];
    
    let lastError = null;
    let transporter = null;
    let usedConfig = null;
    
    for (const config of configs) {
      try {
        console.log(`\n📡 Testing ${config.name}...`);
        console.log(`   Host: ${config.host}:${config.port}`);
        
        const testTransporter = nodemailer.createTransport(config);
        
        // Verify connection with timeout
        const verifyPromise = testTransporter.verify();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 10000)
        );
        
        await Promise.race([verifyPromise, timeoutPromise]);
        
        console.log(`✅ ${config.name} - CONNECTION SUCCESSFUL!`);
        transporter = testTransporter;
        usedConfig = config;
        break;
        
      } catch (error) {
        console.log(`❌ ${config.name} - FAILED: ${error.message}`);
        lastError = error;
        logError(error, `${config.name} - Connection Attempt`, {
          host: config.host,
          port: config.port
        });
      }
    }
    
    if (!transporter) {
      throw lastError || new Error('All connection attempts failed');
    }
    
    logSuccess('SMTP Connection Established', {
      Method: usedConfig.name,
      Host: usedConfig.host,
      Port: usedConfig.port
    });
    
    // Format date
    const currentDate = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    const htmlContent = createBeautifulEmail(firstName, lastName, email, subject, message, currentDate);
    
    const mailOptions = {
      from: `"KJ's Fashion" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `✨ New Contact: ${subject} from ${firstName} ${lastName}`,
      text: `
Name: ${firstName} ${lastName}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Sent from KJ's Fashion contact form
      `,
      html: htmlContent,
    };
    
    // Send email
    console.log('\n📤 Sending email...');
    const info = await transporter.sendMail(mailOptions);
    
    logSuccess('EMAIL SENT SUCCESSFULLY!', {
      MessageId: info.messageId,
      To: process.env.EMAIL_USER,
      From: firstName,
      Subject: subject
    });
    
    res.json({ 
      success: true, 
      message: '✨ Thank you! Your message has been sent successfully.',
      messageId: info.messageId
    });
    
  } catch (error) {
    logError(error, 'Final Error', {
      EmailUser: process.env.EMAIL_USER,
      HasPassword: !!process.env.EMAIL_PASS
    });
    
    // User-friendly error messages
    let userMessage = 'Failed to send message. ';
    if (error.code === 'EAUTH' || error.message.includes('Authentication')) {
      userMessage = 'Email authentication failed. Please check your GoDaddy email password. Make sure you are using the correct password for info@kjfashion.com';
    } else if (error.code === 'ECONNECTION' || error.message.includes('timeout')) {
      userMessage = 'Cannot connect to email server. This might be a network issue. Please try again or contact support.';
    } else if (error.message.includes('Invalid login')) {
      userMessage = 'Invalid email or password. Please verify your GoDaddy credentials.';
    } else if (error.responseCode === 535) {
      userMessage = 'Authentication failed (535). Your GoDaddy email password may be incorrect or SMTP access is disabled.';
    }
    
    res.status(500).json({ 
      success: false, 
      error: userMessage,
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Network diagnostic endpoint
app.get('/api/diagnose', async (req, res) => {
  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      emailConfigured: !!process.env.EMAIL_USER,
      smtpHost: process.env.SMTP_HOST || 'smtpout.secureserver.net'
    },
    dnsTests: {},
    portTests: {}
  };
  
  // Test DNS resolution for common SMTP servers
  const hostsToTest = [
    'smtpout.secureserver.net',
    'localhost',
    `mail.${process.env.EMAIL_USER?.split('@')[1] || 'kjfashion.com'}`
  ];
  
  for (const host of hostsToTest) {
    try {
      const { promises: dns } = await import('dns');
      const addresses = await dns.resolve4(host);
      results.dnsTests[host] = { success: true, addresses };
    } catch (error) {
      results.dnsTests[host] = { success: false, error: error.message };
    }
  }
  
  res.json(results);
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('✨ KJ\'s Fashion Server is running!');
  console.log('='.repeat(60));
  console.log(`📧 Email: ${process.env.EMAIL_USER || 'NOT SET - Check .env file'}`);
  console.log(`🎨 Template: Dark Blue & Creme Theme`);
  console.log(`🔧 Debug Mode: ${process.env.NODE_ENV === 'development' ? 'ON' : 'OFF'}`);
  console.log('='.repeat(60));
  console.log(`👉 Frontend: http://localhost:5500/contact.html`);
  console.log(`👉 API Test: http://localhost:3001/api/test`);
  console.log(`👉 Diagnose: http://localhost:3001/api/diagnose`);
  console.log('='.repeat(60) + '\n');
  
  // Startup checks
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  WARNING: Email credentials not found in .env file!');
    console.log('   Create .env file with:');
    console.log('   EMAIL_USER=info@kjfashion.com');
    console.log('   EMAIL_PASS=your_password');
    console.log('='.repeat(60) + '\n');
  } else {
    console.log('✅ Email credentials loaded successfully');
    console.log(`   Account: ${process.env.EMAIL_USER}`);
    console.log('='.repeat(60) + '\n');
  }
});
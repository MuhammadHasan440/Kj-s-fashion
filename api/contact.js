import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { firstName, lastName, email, subject, message } = req.body;
    
    // Validate all required fields
    if (!firstName?.trim()) {
      return res.status(400).json({ success: false, error: 'First name is required' });
    }
    if (!lastName?.trim()) {
      return res.status(400).json({ success: false, error: 'Last name is required' });
    }
    if (!email?.trim()) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }
    if (!subject) {
      return res.status(400).json({ success: false, error: 'Subject is required' });
    }
    if (!message?.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }
    
    // Check environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Missing email configuration');
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error. Please contact support.' 
      });
    }
    
    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    // Verify connection
    await transporter.verify();
    
    // Prepare email
    const mailOptions = {
      from: `"KJ's Fashion" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `Contact Form: ${subject} from ${firstName} ${lastName}`,
      text: `
Name: ${firstName} ${lastName}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Sent from KJ's Fashion contact form</small></p>
      `,
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    // Return success
    return res.status(200).json({ 
      success: true, 
      message: 'Thank you! Your message has been sent successfully.' 
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Provide user-friendly error messages
    if (error.code === 'EAUTH') {
      return res.status(500).json({ 
        success: false, 
        error: 'Email authentication failed. Please check your Gmail app password.' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to send message. Please try again later.' 
    });
  }
}
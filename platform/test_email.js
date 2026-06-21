const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'vikas.sangwal.05@gmail.com',
    pass: 'bjmcrensqyfqjyyt'
  }
});

async function testEmail() {
  try {
    const info = await transporter.sendMail({
      from: '"DevFort Team" <vikas.sangwal.05@gmail.com>',
      to: 'vikas.sangwal.05@gmail.com',
      subject: 'Test Email from DevFort',
      text: 'If you receive this, the App Password is correct!'
    });
    console.log('Email sent successfully!', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

testEmail();

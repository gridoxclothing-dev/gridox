require('dotenv').config({ path: './.env' });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

const mailOptions = {
  from: process.env.SMTP_EMAIL,
  to: process.env.SMTP_EMAIL,
  subject: "Test Email from GriDox Script",
  text: "If you receive this, your SMTP settings are perfectly working!"
};

transporter.sendMail(mailOptions)
  .then(info => console.log('Email sent successfully:', info.response))
  .catch(err => console.error('Email failed:', err));

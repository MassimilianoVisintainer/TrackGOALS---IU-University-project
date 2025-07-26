const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send reminder email to user.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Email content
 */
const sendReminderEmail = async (to, subject, text) => {
  const msg = {
    to,
    from: process.env.FROM_EMAIL,
    subject,
    text,
  };

  try {
    await sgMail.send(msg);
    console.log(`Reminder sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error.response?.body || error.message);
  }
};

module.exports = { sendReminderEmail };

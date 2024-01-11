const { default: mongoose } = require("mongoose");
const nodeMailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodeMailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        Pass: process.env.MAIL_PASS,
      }
    })

    let info = await transporter.sendMail({
      from: 'E-Learning Platform',
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    })
    console.log(info);
    return info;

  } catch (error) {
    console.log(error.message);

  }
}

module.exports = mailSender;
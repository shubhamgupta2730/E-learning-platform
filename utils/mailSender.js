const { default: mongoose } = require("mongoose");
const nodeMailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodeMailer.createTransport({
      //this function takes info of host and user to send mail form env file
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        Pass: process.env.MAIL_PASS,
      }
    })

    let info = await transporter.sendMail({
      //it is used to send email
      from: 'E-Learning Platform',
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    })
    console.log(info);
    //if mail is sent successfully , then it returns the information
    return info;


  } catch (error) {
    console.log("Mail is not sent",error.message);

  }
}

module.exports = mailSender;
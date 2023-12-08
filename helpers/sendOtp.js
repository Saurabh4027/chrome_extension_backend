const nodemailer = require("nodemailer");
require("dotenv").config();

const sendOtpEmail = (email,otp) => {
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.GMAIL,
            pass:process.env.GMAIL_PASSWORD
        }
    })
    const mailOptions = {
        from:process.env.GMAIL,
        to:email,
        subject:"OTP Verification Chrome Extension",
        text:`Your OTP is ${otp}`
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

module.exports = sendOtpEmail
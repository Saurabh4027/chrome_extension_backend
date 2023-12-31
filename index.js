const express = require("express");
const getRhyme = require("./helpers/helper");
require('dotenv').config()
const cors = require("cors");
const Otp = require("./models/otpModel");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const generateAlphanumericCode = require("./helpers/generateCode");
const app = express();
const transporter = nodemailer.createTransport({
        host:"smtp.gmail.com",
        port : 587,
        secure : false,
        auth:{
            user:process.env.GMAIL,
            pass:process.env.GMAIL_PASSWORD
        }
})
app.use(cors())
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("THIS IS THE HOME ROUTE - Laxya Rupeja")
})

app.post("/rhyme-headlines",async(req,res)=>{
    const {articleLink} = req.body;
    if(!articleLink){
        return res.status(404).json({message:"No Article Link is Provided"})
    }
    const articleData = await getRhyme(articleLink);
    res.status(200).json({headline:articleData.convertedHeadline,biasSummary:articleData.biasSummary})    
})
app.post('/validate-email', async (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    const otp = generateAlphanumericCode(6);
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
    await Otp.findOneAndUpdate({ email }, { email,otp }, { upsert: true });
    res.json({ success: true, message: 'OTP sent successfully' });
});

app.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
  
    const storedOtpData = await Otp.findOne({ email });
  
    if (!storedOtpData || otp != storedOtpData.otp) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }
    await Otp.findOneAndDelete({ email });
  
    res.json({ success: true, message: 'OTP verified successfully' });
  });

app.listen(8080,async()=>{
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Server started at PORT 8080");
})


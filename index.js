const express = require("express");
const getRhyme = require("./helpers/helper");
require('dotenv').config()
const cors = require("cors");
const sendOtpEmail = require("./helpers/sendOtp");
const Otp = require("./models/otpModel");
const mongoose = require("mongoose");
const generateAlphanumericCode = require("./helpers/generateCode");
const app = express();
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
    sendOtpEmail(email, otp);
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


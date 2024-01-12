const User = require("../models/user");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();





//sendOTP:
exports.sendOTP = async (req, res) => {
  //fetch email from request body
  try {
    const { email } = req.body;
    //check if user already exist
    const checkUserPresent = await User.findOne({ email });

    //if user already exist , then return a response
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "user already registered",
      })
    }

    //generate otp
    var otp = otpGenerator.generate(6, {
      ///length of otp is 6
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("OTP generated: ", otp);

    //otp should be unique: 
    const result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,

      });
      result = await OTP.findOne({ otp: otp });
    }

    //store this otp in db

    const otpPayload = { email, otp };

    const otpBody = await OTP.create(otpPayload);

    //return response successfull
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp,
    })



  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    })

  }
}




//signup:
exports.signup = async (req, res) => {

  //data fetch from request body
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp
    } = req.body;

    //data validate
    if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",

      })
    }


    // dono password ko match kr lo :
    //pass or confirm pass ko
    if (password !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "password and confirm password does not match, try again",
      });
    }

    //check if user is already registered: 
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "user is already registered",
      });
    }

    //find most recent otp for user
    const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    console.log(recentOtp);


    //validate otp
    if (recentOtp.length === 0) {
      //otp not found
      return res.status(401).json({
        success: false,
        message: "otp not found",
      })
    } else if (otp !== recentOtp.otp) {
      //invalid otp
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      })
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //entry create in db

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,

    })

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      //we have to give object id of profile in addtional details, so created an function profileDeatils
      additionalDetails: profileDetails._id,
      //taking api from dicebear for storing image from letters from fname and lname, 
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    })

    ///return response
    return res.status(200).json({
      success: true,
      message: "User is registered suuccessfully",
      user,
    })
  } catch (error) {
    console.log("User is not registered", error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered, please try again!!",

    })

  }
}



//login:

exports.login = async (req, res) => {
  try {
    //get data from req body
    const { email, password } = req.body;

    //validation of data

    if (!email || !password) {
      res.status(403).json({
        success: false,
        message: "All fields are required, try again!!",
      });
    }

    //check user exist or not

    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!users) {
      return res.status(401).json({
        success: false,
        message: "user is not registered , please register first!!",
      });
    }

    //match password
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      }
      //generate jwt token
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",

      });
      user.token = token;
      user.password = undefined;




      //create cookie 
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      }
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
      })



    }
    //send response
    else {
      return res.status(401).json({
        success: false,
        message: "password is incorrect",
      });

    }
  }

  catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login failure, try again!!",
    });


  }
}




//changePassword: 
exports.changePassword = async (req, res) => {
  //get data from req body
  //get old password, newPassword, and confirm password
  //validation
  //update password in database
  //send mail for password update
  //return response
}


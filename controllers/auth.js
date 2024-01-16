const User = require("../models/user");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/temp/passwordUpdate");
const Profile = require("../models/Profile");
require('dotenv').config();


//sendOTP Controller:
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
        message: "user already registered with this email",
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
    //otp payload is a object: 
    const otpPayload = { email, otp };
    //otp.create: creates an entry in db in otp collection
    const otpBody = await OTP.create(otpPayload);
    console.log("otp created: ", otpBody);

    //return response successful
    res.status(200).json({
      success: true,
      message: "OTP created successfully and sent to your email",
      otp,
    })



  } catch (error) {
    console.log("cannot generate otp ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    })

  }
}




//signup Controller:
exports.signup = async (req, res) => {

  //data fetch from request body
  //data validate
  // dono password ko match kr lo :
  //pass or confirm pass ko
  //check if user is already registered: 
  //find most recent otp for user
  //validate otp
  //hash password
  //entry create in db
  ///return response


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
        message: "All fields are required , try again!!",

      });
    }


    // dono password ko match kr lo :
    //pass or confirm pass ko
    if (password !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "password and confirm password does not match, try again !!",
      });
    }

    //check if user is already registered: 
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "user is already registered with this email",
      });
    }

    //find most recent otp for user based on email
    const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    console.log(recentOtp);

    //The sort({ createdAt: -1 }) part sorts the results in descending order by the createdAt field, so the most recent document comes first. The limit(1) part limits the results to the first document only. 


    //validate otp
    if (recentOtp.length === 0) {
      //otp not found
      return res.status(400).json({
        success: false,
        message: "otp not found , please generate otp first",
      })
    } else if (otp !== recentOtp[0].otp) {
      //invalid otp
      return res.status(400).json({
        success: false,
        message: "Invalid OTP , please try again!!",
      })
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //entry create in db

    //create addItionAL details for user:--
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

      //we have to give object id of profile in additional details, so created an function profileDetails

      additionalDetails: profileDetails._id,

      //taking api from dicebear for storing image from letters from fname and lname, 
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    })

    ///return response
    return res.status(200).json({
      success: true,
      message: "User is registered successfully",
      user,
    })
  } catch (error) {
    console.log("User is not registered", error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered, please try again !!",

    })

  }
}



//login Controller:

exports.login = async (req, res) => {
  try {
    //get data from req body
    //validation of data
    //check user exist or not
    //match password
    //generate jwt token
    //create cookie 
    //send response


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

    //populate function is used to fetch the user's profile details along with the user's own details.
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
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
      //sign method is used to generate token

      //The sign method takes three arguments: the payload of the token, the secret key to sign the token, and an options object.
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",

      });
      user.token = token;
      user.password = undefined;




      //create cookie
      // a cookie is being created to store the JWT (JSON Web Token) for the user. The cookie will be sent to the client and stored there. The client will then send the cookie back to the server with every request, so the server can verify the JWT and identify the user.

      //creating option object for cookie
      const options = {
        //expires in 3 days
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        //cookie can only be accessed by server
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
        message: "password is incorrect , try again!!",
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




//changePassword Controller: 

exports.changePassword = async (req, res) => {
  //get data from req body
  //get old password, newPassword, and confirm password
  //validation
  //hash password
  //update password in database
  //send mail for password update
  //return response


  try {
    const userDetails = await User.findById(req.user.id)
    //get data from req body
    const { oldPassword, newPassword } = req.body;

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    )
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" })
    }

    //hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    //update password in database
    const updatedUserDetails = await User.findOneAndUpdate(
      req.user.id,
      { password: hashedPassword },
      { new: true }
    )
    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      )
      console.log("Email sent successfully:", emailResponse.response)
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      })
    }


    //return response
    return res.status(201).json({
      success: true,
      message: "Password changed successfully",
    });




  } catch (error) {
    console.log("Error changing password: ", error.message);
    return res.status(500).json({
      success: false,
      message: "Password has not changed, try again!!",
    })

  }
}



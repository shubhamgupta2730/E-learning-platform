const User = require("../models/user");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcryptjs");


//resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
  try {
    //get email from req body
    const email = req.body.email;

    //check user for this mail, email validation
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email is not registered!!!",
      });
    }
    //generate token
    const token = crypto.randomUUID();
    //update user by adding token and expiratin time
    const updateDetails = await user.findOneAndUpdate({ email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      //new true, returns the updated details in response of a user
      { new: true });
    //create url
    const url = `http://localhost:3000/update-password/${token}`;

    //send mail to user
    await mailSender(email, "Password reset Link: ",
      `Password reset link: ${url}`);


    //return response
    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });


  } catch (error) {
    console.log("reset password email not sent", error);
    return res.status(500).json({
      success: false,
      message: "something went wrong,while reset!!!",
    });

  }


}

//reset password 

exports.resetpassword = async (req, res) => {
  try {
    //data fetch
    const { password, confirmPassword, token } = req.body;
    //validation
    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "Password not matching",
      });

    }
    //get user detials from db using token
    const userDetails = await User.findOne({ token: token });
    //if no entry, means invalid token
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Token is invalid",
      });

    }
    //token time check
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.json({
        success: false,
        message: "Token is expired!!!, please regenerate token",
      });
    }


    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //update password
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true },

    );
    //reutrn response
    return res.status(200).json({
      success: true,
      message: "Reset Successfull",

    });
  }
  catch (error) {
    console.log("Reset password Unsuccessful: ", error);
    return res.status(500).json({
      success: false,
      message: "Password is not reset, try again!!!",

    });


  }
}

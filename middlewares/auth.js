const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();


//auth


exports.auth = async (req, res, next) => {
  try {
    // Extract token
    const token = req.cookies.token || req.body.token || (req.headers.authorization && req.headers.authorization.replace("Bearer ", ""));
    
    // If token is missing, return response
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing, please try again",
      });
    }

    // Verify the token 
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);
      req.user = decode;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or expired, please try again",
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong while validating the token, please try again",
    });
  }
};


//isStudent
exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "this is route for student only !!!",
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, try again later",
    });

  }
  next();

}

//isInstructor
exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "this route is for instructors only !!!",
      });
    }
    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "instructor role cannot be verified!!",
    });

  }

}

//isAdmin
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "this route is for admin only!!!",
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Admin role cannot be verified!!",
    });

  }
}
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();


//auth
exports.auth = async (req, res, next) => {
  try {
    //extract token
    const token = req.cookie.token || req.body.token || req.header("Authorization").replace("Bearer", "");

    //if token missing then return response
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing , please try again",
      });
    }
    //verify the token 
    try{
      const decode =  jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);
      req.user = decode;
    }
    catch(error){
      return res.status(401).json({
        success: false,
        message: "Token is invalid , please try again",
      });
    }
    next();


  } catch (error) {
    return res.status(401).json({
      success : false,
      message: "something went wrong while validating the token , please try again",
    });

  }
}


//isStudent
exports.isStudent = async(req, res, next){
  try {
  if(req.user.accountType!== "Student"){
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
exports.isInstructor = async(req, res, next){
  try {
    if(req.user.accountType!== "Instructor"){
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
exports.isAdmin = async(req, res, next)=>{
  try {
    if(req.user.accountType!=="Admin"){
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
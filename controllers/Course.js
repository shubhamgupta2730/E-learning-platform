const Course = require("../models/Course");
const Tag = require("../models/tags");
const User = require("../models/user");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

///1. create course handler function------

exports.createCourse = async (req, res) => {
  try {

    //steps for course creation: 

    //data fetch from body

    //file fetch from req.file

    //instructor validation

    //fetch data: 
    const { courseName, courseDescription, whatYouWillLearn, tag } = req.body;

    //get thumbnail: 
    const thumbnail = req.files.thumbnailImage;

    //validation: 
    if (!courseName || !courseDescription || !price || !tag || !thumbnail) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!!",
      });
    }

    //check for instructor for object id : 
    //db calling for this,:
    //TODO: verify that userId and instructor._id is same or different...!!!!!!!!!---------------------

    
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("Instructor Details: ", instructorDetails);

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor details not found",
      });
    }


    //check given tag is valid or not:
    //here tag is a Id as we have made it objectId in models,,, 
    const tagDetails = await Tag.findById(tag);

    if (!tagDetails) {
      return res.status(404).json({
        success: false,
        message: "Tag details not found",
      });
    }


    //upload image to cloudinary

    const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

    //Create an entry for new course:
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag: tagDetails._id,
      thumbnail: thumbnailImage.secure_url,
    })

    //update instructor: 

    //add this course to instructor's course list: 
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },

      //instructor ke course ke array ke andr jo nya  course hai uski id insert krni hai

      {
        $push:
          { courses: newCourse._id, }
      },
      { new: true },)

    //update Tag Schema
    //add this course to tag's course list:
    await Tag.findByIdAndUpdate(
      { _id: tagDetails._id },
      {
        $push:
          { courses: newCourse._id, }
      },
      { new: true },)


    //return response:
    return res.status(200).json({
      success: true,
      message: "course created successfully.",
      data: newCourse,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create new course",
    });


  }
}




///2. getAllCourse handler function:=--------------

exports.showAllCourses = async (req, res) => {
  try {


   // //TODO: change the below statement: 

    const allCourses = await Course.find({}, {
      courseName: true,
      price: true,
      thumbnail: true,
      instructor: true,
      ratingAndReviews: true,
      studentEnrolled: true,
    }).populate("Instructor").exec();

    //return response:
    return res.status(200).json({
      success: true,
      message: "Data for all courses fetch successfully",
      data: allCourses,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
}






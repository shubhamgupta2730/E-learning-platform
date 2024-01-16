const Course = require("../models/Course");
const Category = require("../models/category");
const User = require("../models/user");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const CourseProgress = require("../models/CourseProgress");
const { convertSecondsToDuration } = require("../utils/secToDuration");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");

///1. create course handler function------

exports.createCourse = async (req, res) => {
  try {

    //steps for course creation: 

    //data fetch from body

    //file fetch from req.file

    //instructor validation

    //fetch data: 
    const { courseName, courseDescription, whatYouWillLearn, category } = req.body;

    //get thumbnail: 
    const thumbnail = req.files.thumbnailImage;

    //validation: 
    if (!courseName || !courseDescription || !price || !category || !thumbnail) {
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


    //check given category is valid or not:
    //here category is a Id as we have made it objectId in models,,, 
    const categoryDetails = await Category.findById(category);

    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category details not found",
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

    //update Category Schema
    //add this course to categories course list:
    await Category.findByIdAndUpdate(
      { _id: categoryDetails._id },
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



//3 getCourseDetails---------------------

//want actual data, not only object id:
exports.getCourseDetails = async (req, res) => {
  try {
    //get course id: 
    const { courseId } = req.body;

    //find course details: 
    const courseDetails = await Course.find({ _id: courseId },
    ).populate(
      {
        path: "instructor",
        populate: {
          path: "additionalDetails",

        },
      }
    )
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: ({
          path: "subSection",
        }),
      })
      .exec();

    //validation:-----
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `could not find the course with ${courseId}`
      })
    }

    //return response

    return res.status(200).json({
      success: true,
      message: "course details fetched successfully",

    });


  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Could not find course details!!",
    });



  }
}






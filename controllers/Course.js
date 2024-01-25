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

    const { courseName, courseDescription, whatYouWillLearn, category, instructions: _instructions, tag: _tag } = req.body;

    const userId = req.user.id;

    //get thumbnail: 
    const thumbnail = req.files.thumbnailImage;

    const tag = JSON.parse(_tag)
    const instructions = JSON.parse(_instructions)


    console.log("tag", tag)
    console.log("instructions", instructions)

    //validation: 
    if (!courseName || !courseDescription || !price || !category || !thumbnail || !whatYouWillLearn || !instructions.length || !tag.length) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!!",
      });
    }

    if (!status || status === undefined) {
      status = "Draft"
    }

    //check for instructor for object id : 

    //db calling for this,:
    //TODO: verify that userId and instructor._id is same or different...!!!!!!!!!---------------------



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
      tag,
      category: categoryDetails._id,

      thumbnail: thumbnailImage.secure_url,
      status: status,
      instructions: instructions,
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

exports.getAllCourses = async (req, res) => {
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
    const courseDetails = await Course.findOne({ _id: courseId },
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




exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    console.log("courseProgressCount : ", courseProgressCount)

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Edit Course Details
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const updates = req.body
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    // If Thumbnail Image is found, update it
    if (req.files) {
      console.log("thumbnail update")
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      )
      course.thumbnail = thumbnailImage.secure_url
    }

    // Update only the fields that are present in the request body
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key])
        } else {
          course[key] = updates[key]
        }
      }
    }

    await course.save()

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 })

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}
// Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnroled
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section.subSection
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId)
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}






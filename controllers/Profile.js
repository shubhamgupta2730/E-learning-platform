const Profile = require("../models/Profile");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//update profile:------------
exports.updateProfile = async (req, res) => {
  try {
    //get data
    //get user id
    //validation
    //find profile
    //update profile
    //return response

    //get data: 
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;

    //get user id:
    //user id can be obtained from req.body as we have added user id in auth middleware as decode:-
    const id = req.user.id;

    //validation:
    if (!contactNumber || !gender || !id) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!!",
      });
    }

    //find profile: 
    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetails;
    const profileDetails = findById(profileId);

    //updation:
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;
    //because object already create hua hai to bs save krna hai is method se,,,

    await profileDetails.save();

    //return response
    return res.status(200).json({
      success: true,
      message: "Profile Details updated",
    });


  } catch (error) {
    return res.status(500).json({

      success: false,
      message: "Profile Not Updated!!",

    });


  }
}



//delete account Controller function----------

exports.deleteAccount = async (req, res) => {
  try {

    //get id
    //validate id
    //delete profile of that user first
    //delete user
    //return response

    //get id:-
    const id = req.user.id;

    //validate id:
    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    //todo:unenroll user from all enrolled courses: 

    //delete profile of that user first
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });
    //delete user
    await User.findByIdAndDelete({ _id: id });
    //return response
    return res.status(200).json({
      success: true,
      message: "User deleted Successfully",
    });



  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Not deleted, try again!!",
    });

  }
}

//to get all details of a user: 
exports.getAllUserDetails = async (req, res) => {
  try {
    //get id: 
    const id = req.user.id;

    //get userDetails:
    const userDetails = await User.findById(id).populate("additionalDetails").exec(1);



    //validation
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "User details not found!!!",
      });
    }

    //return response:
    return res.status(200).json({
      success: true,
      message: "user data fetched successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User details are not fetched!!",
    });

  }
}

exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    console.log("displayPicture", displayPicture);
    console.log("userId", userId);
    if (!displayPicture) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      })
    }

    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    console.log("image", image)
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    )
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "image not uploaded",
    })
  }
}

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec()
    userDetails = userDetails.toObject()
    var SubsectionLength = 0
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      SubsectionLength = 0
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        )
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSection.length
      }
      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      })
      courseProgressCount = courseProgressCount?.completedVideos.length
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier
      }
    }

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id })

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnrolled.length
      const totalAmountGenerated = totalStudentsEnrolled * course.price

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        // Include other course properties as needed
        totalStudentsEnrolled,
        totalAmountGenerated,
      }

      return courseDataWithStats
    })

    res.status(200).json({ courses: courseData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}
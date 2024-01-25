const RatingAndReview = require("../models/RatingAndreview");
const Course = require("../models/Course");
const { getUserDetails } = require("./Profile");
const RatingAndreview = require("../models/RatingAndreview");


//1. create rating-------------------------------------
exports.createRating = async (req, res) => {
  try {
    //get userID
    const userId = req.user.id;

    //fetch data from req body
    const { rating, review, courseId } = req.body;
    //validation if user is enrolled in course or not
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $eleMatch: { $eq: userId } },
    });

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: 'student is not enrolled in the course',
      });
    }
    //check it user is already reviewed the course
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,

    });
    //vaalidation: 
    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "Course is already reviewed by user!!",
      });
    }


    //create rating review
    const RatingReview = await RatingAndReview.create({
      rating, review,
      course: courseId,
      user: userId,
    });

    //update course with this rating review
    const updatedCourseDetails = await Course.findByIdAndUpdate({ _id: courseId },
      {
        $push: {
          ratingAndReviews: ratingReview._id,
        }
      }, { new: true });
    console.log(updatedCourseDetails);



    //return response
    return res.status(200).json({
      success: true,
      message: "Rating and Review Successfully", ratingReview,
    });



  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: " Internal server error!!",
    })

  }
}


//average rating:-
exports.getAverageRating = async (req, res) => {
  try {
    //get course id:
    const courseId = req.body.courseId;


    //calculate average rating:
    const result = await RatingAndReview.aggregate([
      { $match: { course: new mongoose.Types.ObjectId(courseId), }, },
      { $group: { _id: null, averageRating: { $avg: "$rating" } } },
    ]);



    //return rating: 
    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: result[0].averageRating,
      });
    }

    //if no rating is there:
    return res.status(200).json({
      success: true,
      message: "average rating is 0, no rating is there",
    });

  } catch (error) {

  }
}

//get all  rating and reviews:-----------------------------------
exports.getAllRating = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();

    //return response:
    return res.status(200).json({
      success: true,
      message: "All reviews fetched successfully",
      data: allReviews,
    });





  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error!!",
    })

  }
}


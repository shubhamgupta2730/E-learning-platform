const { instance } = require("../config/razorpay");

const Course = require("../models/Course");
const User = require("../models/user");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/temp/courseEnrollmentEmail");

//capture the payment and initiate the razorpay order: 
exports.capturePayment = async (req, res) => {

  //get courseId and userId
  const { course_id } = req.body;
  const userId = req.user.id;
  //validation
  if (!course_id) {
    return res.status(400).json({
      success: false,
      message: "provide valid course id",
    });
  }
  //valid course id
  let course;
  try {
    course = await Course.findById(course_id);
    //valid course details
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "could not find the course",
      });
    }
    //user already paid for same course

    //user id which was in string type is converted to object type:because it is existing as object id inside course model. 
    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentEnrolled.includes(uid)) {
      return res.status(400).json({
        success: false,
        message: "Student is already enrolled",
      });
    }

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

  //order create
  const amount = course.price;
  const currency = "INR";

  const options = {
    amount: amount * 100,
    currency,
    receipt: Math.random(Date.now()).toString(),
    notes: {
      courseId: course_id,
      userId,
    }

  };

  try {

    //initiate payment using razorpay
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);

    //return response
    return res.status(200).json({
      success: true,
      courseName: Course.courseName,
      courseDescription: Course.courseDescrtiption,
      thumbnail: Course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,


    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Could not initiate order",
    })

  }
};


//? VERIFY SIGNATURE  ****

exports.verifySignature = async (req, res) => {

  //server data(secret key): 
  const webhookSecret = "12345678";
  //razorpay data(secret key): 
  //razorpay sends secret key  in hashed format: 
  const signature = req.headers["x-razorpay-signature"];

  //so we have to apply same hashing encryption for webhook secret so that it can be matched with the signature from razorpay.

  //HMAC  is a combination of hashing algorithm and secret key,

  //we get hmac object:
  const shaSum = crypto.createHmac("sha256", webhookSecret);
  //convert hmac object to string format: 
  shaSum.update(JSON.stringify(req.body));

  //? the output comes after hashing algo. applies is known as DIGEST ----------(exist in hexadecimal form)

  const digest = shaSum.digest("hex");

  //now we have to match digest and signature:
  if (signature === digest) {
    console.log("Payment is authorized.")



    //action after authorization: 
    //now user should enroll in course purchased:

    //we have to find the user id and course id : 
    //request is done from razorpay api so we cant use request body to get id, so we take id from notes in order create in payment controller.js

    const { courseId, userId } = req.body.payload.entity.notes;

    try {

      //action:
      //find course and enroll student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true },
      );

      if (!enrolledCourse) {
        return res.status(400).json({
          success: false,
          message: "Course not found",
        });
      }
      console.log(enrolledCourse);

      //find the student and add course to their list of enrolled courses: 
      
      const enrolledStudent = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { courses: courseId } },
        { new: true },
      );
      console.log(enrolledStudent);

      //confirmation mail send to user: 
      const emailResponse = await mailSender(
        enrolledStudent.email,
        "Congratulations from portal",
        "Congratulations, you are onboard into course",
      )
      console.log(emailResponse);

      return res.status(200).json({
        success: true,
        message: "signature verified",
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Signature is not verified!!!",
      });

    }
  }
  else{
    return res.status(400).json({
      success: false,
      message: "Invalid request",
    });
  }


}

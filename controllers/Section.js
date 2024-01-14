const Section = require("../models/Section");
const Course = require("../models/Course");


//create section:-------------

exports.createSection = async (req, res) => {
  try {
    //data fetch
    //data validation
    //create section
    //update course with section objectId
    //return response


    //data fetch:
    const { sectionName, courseId } = req.body;

    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!!",
      });
    }

    //create section
    const newSection = await Section.create({ sectionName });

    //update course with section objectId: 
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {

        $push: {
          courseContent: newSection._id,
        }
      },
      { new: true },
    ).populate("courseContent");

    //return response
    return res.status(200).json({
      success: true,
      message: "Section created Successfully",
    });


  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to create Section",

    });

  }
}

//update section:-------------

exports.updateSection = async (req, res) => {
  try {
    //data input
    //data validation
    //update data
    //return response

    //data input:
    const { sectionName, sectionId } = req.body;

    //data validation:
    if (!sectionId || !sectionName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //update data:
    const section = await Section.findByIdAndUpdate(sectionId, { sectionName }, { new: true });

    //return response
    return res.status(500).json({
      success: true,
      message: "Section Updated Successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update Section",
    });
  }
}
//delete section:-----------

exports.deleteSection = async (req, res) => {
  try {
    //get id
    //use findbyid and delete
    //return response

    //get id: -assuming that we are sending id in params
    const { sectionId } = req.params;

    //delete id

    await Section.findByIdAndDelete(sectionId);

    //TODO: delete id OF section from courseSchema: 


    //return response
    return res.status(200).json({
      success: true,
      message: "Section Deleted Successfully",

    });


  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete Section",
    });

  }
}


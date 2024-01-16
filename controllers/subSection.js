const Subsection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { findByIdAndUpdate } = require("../models/category");


//create subSection: 
exports.createSubSection = async (req, res) => {
  try {

    //data fetch
    //extract file/video
    //validation
    //upload video to cloudinary
    //create subsection
    //update section with subsection objectId
    //return response

    //data fetch:
    const { sectionId, title, timeDuration, description } = req.body;

    //extract fie: 
    const video = req.files.videoFile;

    //validation:
    if (!sectionId || !title || !timeDuration || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //upload files to cloudinary
    const uploadDetails = uploadImageToCloudinary(video, process.env.FOLDER_NAME);

    //CREate a subsection: 
    const subSectionDetails = await Subsection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: (await uploadDetails).secure_url,
    });


    
    //update section with subsection objectId:
    const updatedSection = await Section.findByIdAndUpdate({ id: sectionId },
      {
        $push: {
          subSection: subSectionDetails._id,
        }
      },
      { new: true },).populate("createCourse")

    //return response:
    return res.status(200).json({
      success: true,
      message: "Sub Section Created Successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to create subsection",
    });

  }
}


//update subsection: -----------

exports.updateSubSection = async (req, res) => {
  try {
    //data input
    //data validation
    //update data
    //return response

    //data input: 
    const { title, timeDuration, description, videoUrl, subSectionId } = req.body;

    //data validation:
    if (!title || !timeDuration || !description || !videoUrl || !subSectionId) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    //update data:
    const subSection = await subSection.findByIdAndUpdate(subSectionId,
      {
        title: title,
        timeDuration: timeDuration,
        videoUrl: videoUrl,
        description: description,


      }, { new: true },
    );

    //return response:
    return res.status(200).json({
      success: true,
      message: "subSection updated Successfully",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "SubSection updation failed!!!",
    });

  }


}



//delete subsection:--------------

const deleteSubSection = async (req, res) => {
  try {
    //get id
    //use findbyid and delete
    //return response

    //get id from params: 
    const { subSectionId } = req.params;

    //delete id:
    await subSection.findByIdAndDelete(subSectionId);

    //return response:
    return res.status(200).json({
      success: true,
      message: "Sub section deleted Successfully",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "SubSection deletion failed",
    });

  }
}
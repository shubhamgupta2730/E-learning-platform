const Tag = require("../models/tags");

//create tag ka handler function::--

exports.createTag = async (req, res) => {
  try {

    //take name, description from req, body: 
    const { name, description } = req.body;

    //validation: 
    if (!name || !description) {
      return res.status(401).json({
        success: false,
        message: "All fields are required!!",
      });
    }

    //create entry in db: 
    const tagDetails = await Tag.create({
      name: name,
      description: description,
    });

    console.log(tagDetails);

    //return response

    return res.status(200).json({
      success: true,
      message: "Tag created Successfully",
    });



  } catch (error) {
    return res.status(500).json({
      success: False,
      message: error.message,
    });

  }
}


//2nd handler function: ------------

//getAllTags handler function 

exports.showAllTags = async (req, res) => {
  try {
    const allTags = await Tag.find({}, { name: true, description: true });
    return res.status(200).json({
      success: true,
      message: "All tags returned successfully."
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
}
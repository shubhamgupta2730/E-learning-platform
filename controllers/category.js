const Category = require("../models/category");

//create category ka handler function::--

exports.createCategory = async (req, res) => {
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
    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });

    console.log(categoryDetails);

    //return response

    return res.status(200).json({
      success: true,
      message: "Category created Successfully",
    });



  } catch (error) {
    return res.status(500).json({
      success: False,
      message: error.message,
    });

  }
}


//2nd handler function: ------------

//getAllCategories handler function 

exports.showAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find({}, { name: true, description: true });
    return res.status(200).json({
      success: true,
      message: "All categories returned successfully."
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
}
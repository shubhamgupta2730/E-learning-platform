const { Mongoose } = require("mongoose");
const Category = require("../models/category");
function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

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

//showAllCategories handler function 

exports.showAllCategories = async (req, res) => {
  try {
    console.log("INSIDE SHOW ALL CATEGORIES");
    const allCategories = await Category.find({});
    return res.status(200).json({
      success: true,
      message: "All categories returned successfully.",
      data: allCategories,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
}

//category page handler function: ------------
exports.categoryPageDetails = async (req, res) => {
  try {

    //get category id:
    const { categoryId } = req.body;
    console.log("PRINTING CATEGORY ID: ", categoryId);

    //gt courses for specified category id: 
    const selectedCourses = await Category.findById({ _id: categoryId })
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      }).exec();


    //validation:
    if (!selectedCourses) {
      console.log("Category not found.")
      return res.status(404).json({
        success: false,
        message: "No courses found for this category",
      });
    }

    // Handle the case when there are no courses
    if (selectedCategory.courses.length === 0) {
      console.log("No courses found for the selected category.")
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      })
    }

    //get courses for different category:
    const differentCategories = await Category.find({ _id: { $ne: categoryId } })
      //$eq: equal to
      //$ne: not equal to
      .populate("courses").exec();





    //get top selling courses:
    const topSellingCourses = await Course.find({}).sort({ "ratingAndReviews.rating": -1 })
      .populate("instructor").populate("category").populate("ratingAndReviews").populate({
        path: "courseContent",
        populate: ({
          path: "subSection",
        }),
      }).exec();






    //return response:
    return res.status(200).json({
      success: true,
      data: {
        selectedCourses: selectedCourses,
        differentCategories: differentCategories,
      }

    });


  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });


  }
}
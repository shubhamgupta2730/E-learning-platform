const Profile = require("../models/profile");

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



//delete account----------

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
    await User.findByIdAndDelete(_id: id);
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
exports.getUserDetails = async(req, res)=>{
  try {
    //get id: 
    const id = req.user.id;

    //get userDetails:
    const userDetails = await User.findById(id).populate("additionalDetails").exec();



    //validation

    //return response:
    return res.status(200).json({
      success: true,
      message: "user data fetched successfully",
    }) ;
    
  } catch (error) {
    return res.status(500).json({
      success:false,
      message: "User details are not fetched!!",
    });
    
  }
}
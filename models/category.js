const mongoose = require("mongoose");


//TODO:update:  convert tag into category of course,,,,!!!

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },

});

module.exports = mongoose.model("Category", categorySchema);
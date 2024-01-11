const mongoose = require("mongoose");

const ratingAndReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating:{
    type: Number,
    required: true,
  },
  review: {
    required: true,
    type: String,
    trim: true,
  },

});

module.exports = mongoose.model("RatingAndReview", ratingAndReviewSchema);
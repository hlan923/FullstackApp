const mongoose = require("mongoose");

const recipeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ingredients: {
      type: [String],
      required: true,
    },
    instructions: {
      type: [String],
      required: true,
    },
    calories: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    submitted_by: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Recipe", recipeSchema);

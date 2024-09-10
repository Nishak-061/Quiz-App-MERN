const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const optionSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
});

const questionSchema = new Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    questionText: {
      type: String,
      required: function () {
        return (
          this.questionType === "TEXT" || this.questionType === "TEXT-IMAGE"
        );
      },
    },
    imageUrl: {
      type: String,
      validate: {
        validator: function (v) {
          return /^(http|https):\/\/.*\.(jpg|jpeg|png|gif)$/.test(v);
        },
        message: "Invalid image URL format!",
      },
      required: function () {
        return (
          this.questionType === "IMAGE-URL" ||
          this.questionType === "TEXT-IMAGE"
        );
      },
    },
    options: [optionSchema],
    questionType: {
      type: String,
      enum: ["TEXT", "IMAGE-URL", "TEXT-IMAGE"],
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;

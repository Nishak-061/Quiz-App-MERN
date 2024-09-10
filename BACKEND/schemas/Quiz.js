const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Define the schema for an option
const OptionSchema = new Schema({
  text: { type: String },
  imageUrl: { type: String },
  clicks: { type: Number, default: 0 }, // Track the number of clicks
  userIds: [{ type: Schema.Types.ObjectId, ref: "User" }], // Array of user IDs
});

// Define the schema for a question
const QuestionSchema = new Schema({
  questionText: { type: String, required: true },
  options: [OptionSchema], // Use OptionSchema for the options field
  //correctAnswer: { type: mongoose.Schema.Types.ObjectId, ref: 'Option', required: true  }, // Optional field for correct answer, if needed
  correctAnswer: { type: Number, required: true },
});

// Define the schema for a timer
const TimerSchema = new Schema({
  value: { type: Number, enum: [0, 5, 10], default: 0 }, // 0 for OFF, 5 for 5 seconds, 10 for 10 seconds
});

// Define the schema for a quiz
const QuizSchema = new Schema({
  title: { type: String, required: true },
  questionType: {
    type: String,
    enum: [
      "text",
      "image",
      "text-image",
      "Q&A",
      "POLL TYPE",
      "image-url",
      "image-text",
    ],
    required: true,
  },
  questions: [QuestionSchema], // Use QuestionSchema for the questions field
  timer: TimerSchema,
  createdAt: { type: Date, default: Date.now },
  impressions: {
    type: Number,
    default: 0, // Ensure default value
  },
});

// Create and export the Quiz model
const Quiz = mongoose.model("Quiz", QuizSchema);

module.exports = Quiz;

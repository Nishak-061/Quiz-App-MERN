const mongoose = require("mongoose");

const QuizSubmissionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
      selectedOptions: [
        {
          type: mongoose.Schema.Types.ObjectId, // or ObjectId if you're using option IDs
          ref: "Option",
          required: true,
        },
      ],
    },
  ],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const QuizSubmission = mongoose.model("QuizSubmission", QuizSubmissionSchema);

module.exports = QuizSubmission;

const mongoose = require("mongoose");

const QuiznameSchema = new Schema({
  quizName: {
    type: String,
    required: true,
  },
  quizType: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Quizname", QuiznameSchema);

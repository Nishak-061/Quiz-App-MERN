const Question = require("../schemas/Question");

// Create a new question
exports.createQuestion = async (req, res) => {
  try {
    const { questionText, imageUrl, options, questionType, quizId } = req.body;

    const question = new Question({
      questionText,
      imageUrl,
      options,
      questionType,
      quiz: quizId,
    });

    await question.save();
    res
      .status(201)
      .json({ message: "Question created successfully", question });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create question", error: error.message });
  }
};

// Edit an existing question
exports.editQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const { questionText, imageUrl, options, questionType } = req.body;

    const question = await Question.findByIdAndUpdate(
      questionId,
      { questionText, imageUrl, options, questionType },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res
      .status(200)
      .json({ message: "Question updated successfully", question });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update question", error: error.message });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const questionId = req.params.id;

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json(question);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve question", error: error.message });
  }
};

// Get all questions for a specific quiz
exports.getQuestionsByQuizId = async (req, res) => {
  try {
    const quizId = req.params.quizId;

    const questions = await Question.find({ quiz: quizId });

    res.status(200).json(questions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve questions", error: error.message });
  }
};

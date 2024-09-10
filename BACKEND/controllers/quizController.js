// Create a new question
exports.createQuestion = async (req, res) => {
  try {
    const {
      questionId,
      questionText,
      imageUrl,
      options,
      questionType,
      quizId,
    } = req.body;

    const question = new Question({
      questionId,
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

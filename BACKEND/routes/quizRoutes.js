const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const Quiz = require("../schemas/Quiz"); // Make sure the path to the QuizSchema is correct
const authenticateToken = require("../middleware/authMiddlewarte");
const Question = require("../schemas/Question");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken"); // Ensure `jwt` is required here too if used
const QuizSubmission = require("../schemas/QuizSubmissionSchema");

router.post("/quiz/create", authenticateToken, async (req, res) => {
  try {
    const { title, questionType, questions, timer } = req.body;

    // Validation for required fields
    if (!title || !questionType || !questions || questions.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Title, question type, and questions are required.",
        });
    }

    // Convert correctAnswer to the expected type if necessary
    const formattedQuestions = questions.map((question) => {
      return {
        ...question,
        correctAnswer: Number(question.correctAnswer), // Ensure correctAnswer is a number
      };
    });

    const newQuiz = new Quiz({
      userId: req.user._id, // Assuming user ID is attached by the auth middleware
      title,
      questionType,
      questions: formattedQuestions,
      timer,
    });

    const savedQuiz = await newQuiz.save();

    res.status(201).json({
      success: true,
      quizId: savedQuiz._id,
      quizLink: `http://localhost:8080/api/quizzes/quiz/${savedQuiz._id}`,
      message: "Quiz created successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/quiz/:quizId", async (req, res) => {
  const { quizId } = req.params;
  console.log(`Fetching quiz with ID: ${quizId}`);

  const authHeader = req.headers["authorization"];
  console.log("Received Auth Header:", authHeader);

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    console.log("Extracted Token:", token);

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token verified, decoded data:", decoded);
    } catch (error) {
      console.error("Error verifying token:", error);
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
  } else {
    console.log("No Authorization header or not Bearer token");
  }

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    // Increment the impressions count
    quiz.impressions = (quiz.impressions || 0) + 1;
    await quiz.save();

    console.log("Fetched quiz:", quiz);
    res.status(200).json({ success: true, quiz });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
module.exports = router;

router.post("/quiz/:quizId/submit", async (req, res) => {
  const { quizId } = req.params;
  const { answers, userId } = req.body; // Ensure userId is passed in the request body

  // Log the received data for debugging
  console.log("Received data:", { answers, userId });

  if (!Array.isArray(answers)) {
    return res.status(400).json({ error: "answers is not an array" });
  }

  try {
    // Fetch the quiz to check if the options exist
    const quiz = await Quiz.findById(quizId).populate("questions.options");
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    const questionsWithUpdatedOptions = []; // Array to store updated question detail

    // Validate answers and increment click counts
    for (const answer of answers) {
      const question = quiz.questions.id(answer.questionId);
      if (!question)
        return res.status(404).json({ error: "Question not found" });

      for (const optionId of answer.selectedOptions) {
        const option = question.options.id(optionId);
        if (!option) return res.status(404).json({ error: "Option not found" });

        // Increment the clicks for the selected option
        option.clicks = (option.clicks || 0) + 1;

        // Add the userId to the list of users who selected this option, if not already added
        if (!option.userIds.includes(userId)) {
          option.userIds.push(userId);
        }
      }

      // Store the updated question details
      questionsWithUpdatedOptions.push({
        questionId: question._id,
        questionText: question.text,
        options: question.options.map((opt) => ({
          optionId: opt._id,
          optionText: opt.text,
          clicks: opt.clicks,
          userIds: opt.userIds,
        })),
      });
    }

    // Save the updated quiz with incremented click counts and updated userIds
    await quiz.save();

    // Update impression count for the quiz
    await Quiz.findByIdAndUpdate(
      quizId,
      { $inc: { impressions: 1 } }, // Increment the impression count by 1
      { new: true } // Return the updated document
    );

    // Optionally, you can also save the submission details
    const newSubmission = new QuizSubmission({
      quizId,
      answers,
      userId, // Include the userId in the submission
      submittedAt: new Date(),
    });
    await newSubmission.save();

    res
      .status(200)
      .json({
        message: "Answers submitted and click counts updated successfully",
        questions: questionsWithUpdatedOptions,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// Route to get the number of quizzes
router.get("/count", async (req, res) => {
  try {
    const count = await Quiz.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error("Error fetching quiz count:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route to get the number of questions across all quizzes
router.get("/questions/count", authenticateToken, async (req, res) => {
  try {
    // Aggregate all questions from the quizzes
    const count = await Quiz.aggregate([
      { $unwind: "$questions" }, // Flatten the questions array
      { $count: "totalQuestions" }, // Count the number of documents (questions)
    ]);

    // If count is empty, default to 0
    const questionCount = count.length ? count[0].totalQuestions : 0;
    res.json({ count: questionCount });
  } catch (error) {
    console.error("Error fetching question count:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route to get the number of impressions (e.g., submissions)
router.get("/impressions/count", authenticateToken, async (req, res) => {
  try {
    const count = await QuizSubmission.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error("Error fetching impressions count:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Increment impressions for a specific quiz
router.post("/quiz/:quizId/impression", async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    // Increment the impressions count
    quiz.impressions += 1;

    await quiz.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Impression count updated successfully",
      });
  } catch (error) {
    console.error("Error updating impressions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/impressions/:quizId", authenticateToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    res.json({ impressions: quiz.impressions || 0 });
  } catch (error) {
    console.error("Error fetching impressions for quiz:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

// Route to get quiz details for analytics
router.get("/analytics", async (req, res) => {
  try {
    const quizzes = await Quiz.aggregate([
      {
        $lookup: {
          from: "quizsubmissions", // The collection name for submissions
          localField: "_id",
          foreignField: "quizId",
          as: "submissions",
        },
      },
      {
        $addFields: {
          impressions: { $size: "$submissions" }, // Count the number of submissions
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          createdAt: 1,
          impressions: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, quizzes });
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

router.delete("/questions/:questionId", async (req, res) => {
  const { questionId } = req.params;

  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: "Invalid question ID" });
    }

    // Find the quiz that contains the question
    const quiz = await Quiz.findOne({ "questions._id": questionId });

    if (!quiz) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Filter out the question by its ID
    quiz.questions = quiz.questions.filter(
      (question) => question._id.toString() !== questionId
    );

    // Save the updated quiz
    await quiz.save();

    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    res
      .status(500)
      .json({ message: "Failed to delete question", error: error.message });
  }
});

module.exports = router;

//delete logic
router.delete("/quiz/:quizId", authenticateToken, async (req, res) => {
  try {
    const { quizId } = req.params; // Correctly extract quizId from params
    const result = await Quiz.findByIdAndDelete(quizId);

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//Router for question
router.get("/questions/:quizId", async (req, res) => {
  const { quizId } = req.params;
  try {
    const quiz = await Quiz.findById(quizId).populate({
      path: "questions.options",
      select: "text userIds",
    });

    console.log("Quiz fetched:", quiz);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Map over questions and options to include user counts
    const questionsWithCounts = quiz.questions.map((question) => ({
      _id: question._id,
      questionText: question.questionText,
      options: question.options.map((option) => ({
        _id: option._id,
        text: option.text,
        count: option.userIds.length, // Count users who selected the option
      })),
    }));

    res.json({ questions: questionsWithCounts });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

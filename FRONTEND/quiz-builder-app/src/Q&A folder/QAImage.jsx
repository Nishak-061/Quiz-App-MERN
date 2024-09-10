import React, { useState } from "react";
import "./QAImage.css";
import axios from "axios";
import { toast } from "react-toastify";
import QACongrats from "./QACongrats";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const QAImage = ({ selectedOption, handleOptionChange, onClose }) => {
  const [questionText, setQuestionText] = useState(""); // State for the question text
  const [imageUrls, setImageUrls] = useState(["", "", ""]); // State for the 4 image URLs
  const [questions, setQuestions] = useState([]); // State to store all the questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null); // State for tracking the current question
  const [quizLink, setQuizLink] = useState(""); // State to store the quiz link
  const [showCongrats, setShowCongrats] = useState(false);
  const [quizId, setQuizId] = useState(null); // Add this state to manage quizId
  const [quizPublished, setQuizPublished] = useState(false); // State to track if quiz is published
  const [selectedTimer, setSelectedTimer] = useState(0); // Default to OFF (0 sec)
  const [quizTitle, setQuizTitle] = useState("");
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null); // New state for correct answer

  const handleAddQuestion = () => {
    if (questions.length < 5) {
      if (
        correctAnswerIndex === null ||
        correctAnswerIndex === undefined ||
        isNaN(correctAnswerIndex)
      ) {
        toast.warning(
          "Please select a correct answer before adding the question."
        );
        return;
      }

      const newQuestion = {
        questionText,
        options: imageUrls
          .map((url) => ({ imageUrl: url.trim() }))
          .filter((option) => option.imageUrl), // Remove empty URLs
        timer: selectedTimer,
        correctAnswer: correctAnswerIndex, // Save the correct answer index
      };

      if (!questionText.trim() || newQuestion.options.length === 0) {
        toast.warning("Please enter valid question text and image URLs.");
        return;
      }

      setQuestions([...questions, newQuestion]);
      console.log("Newly Added Question:", newQuestion); // Log the added question
      console.log("Updated Questions Array:", [...questions, newQuestion]); // Log the updated questions array
      setQuestionText("");
      setImageUrls(["", "", "", ""]);
      setSelectedTimer(0);
      setCorrectAnswerIndex(null); // Reset the correct answer
      setCurrentQuestionIndex(questions.length);
    } else {
      toast.warning("You can't add more than 5 questions.");
    }
  };

  const handleQuestionSelect = (index) => {
    const selectedQuestion = questions[index];
    if (selectedQuestion) {
      setCurrentQuestionIndex(index);
      setQuestionText(selectedQuestion.questionText || "");
      setImageUrls(
        selectedQuestion.options.map((option) => option.imageUrl || "")
      );
      setSelectedTimer(selectedQuestion.timer || 0);
    }
  };

  const handleCreateQuiz = async () => {
    const authToken = localStorage.getItem("auth-token");

    if (!authToken) {
      toast.error("No authentication token found. Please log in.");
      return;
    }

    console.log("Questions Before Filtering:", questions); // Log the questions array

    const filteredQuestions = questions
      .filter((question, index) => {
        console.log(`Processing Question ${index + 1}:`, question); // Log each question being processed

        const hasValidText =
          typeof question.questionText === "string" &&
          question.questionText.trim() !== "";
        const hasValidOptions =
          Array.isArray(question.options) &&
          question.options.some(
            (option) =>
              typeof option.imageUrl === "string" &&
              option.imageUrl.trim() !== ""
          );
        const hasValidAnswer =
          !isNaN(question.correctAnswer) &&
          question.correctAnswer !== null &&
          question.correctAnswer !== undefined;

        console.log(`Question ${index + 1} Validity:`, {
          hasValidText,
          hasValidOptions,
          hasValidAnswer,
        });

        return hasValidText && hasValidOptions && hasValidAnswer;
      })
      .map((question, index) => ({
        id: `question-${index + 1}`,
        questionText: question.questionText,
        options: question.options.filter(
          (option) => option.imageUrl.trim() !== ""
        ),
        correctAnswer: question.correctAnswer,
        timer: question.timer || null,
      }));

    console.log("Filtered Questions:", filteredQuestions); // Log filtered questions

    const quizData = {
      title: quizTitle || "Q&A Quiz",
      questionType: "Q&A",
      questions: filteredQuestions,
      timer: { value: selectedTimer },
    };

    console.log("Quiz Data Being Sent:", quizData); // Log quiz data

    if (filteredQuestions.length === 0) {
      toast.error("At least one valid question is required.");
      return;
    }

    try {
      const response = await axios.post(
        "https://quiz-app-mern-0bj4.onrender.com/api/quizzes/quiz/create",
        quizData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const createdQuizId = response.data.quizId;
      const frontendQuizLink = `http://localhost:3000/QA-quiz/${createdQuizId}`;
      setQuizId(createdQuizId);
      setQuizLink(frontendQuizLink);
      setShowCongrats(true);
      setQuizPublished(true);
      toast.success("Quiz created successfully!");
    } catch (error) {
      toast.error("Failed to create quiz. Please try again.");
      console.error("Error details:", error.response?.data || error.message);
    }
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
  };

  const handleCloseCongrats = () => {
    setShowCongrats(false); // Close the PollCongrats component
  };

  const handleShareQuizLink = () => {
    navigator.clipboard
      .writeText(quizLink)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch((err) => {
        toast.error("Failed to copy the link. Please try again.");
      });
  };

  const handleDeleteOption = (index) => {
    const newImageUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImageUrls);
  };

  const handleAddOption = () => {
    setImageUrls([...imageUrls, ""]); // Add a new empty option
  };

  const handleTimerChange = (time) => {
    setSelectedTimer(time);

    // Ensure currentQuestionIndex is valid before updating
    if (
      currentQuestionIndex !== null &&
      currentQuestionIndex >= 0 &&
      currentQuestionIndex < questions.length
    ) {
      const newQuestions = [...questions];
      newQuestions[currentQuestionIndex].timer = time;
      setQuestions(newQuestions);
    } else {
      console.error("Invalid question index:", currentQuestionIndex);
    }
  };

  const handleSelectCorrectAnswer = (index) => {
    setCorrectAnswerIndex(index); // Set the selected correct answer
  };

  // Get the style for each option, applying green background for the correct option
  const getOptionStyle = (index) => {
    return {
      backgroundColor: index === correctAnswerIndex ? "green" : "white",
      color: index === correctAnswerIndex ? "white" : "black",
      padding: "10px",
      borderRadius: "5px",
      marginBottom: "10px",
      cursor: "pointer",
    };
  };

  return (
    <div className="qaimage-container">
      {showCongrats && (
        <div className="pollcongrats-overlay">
          <QACongrats
            quizLink={quizLink}
            quizId={quizId}
            onClose={handleCloseCongrats}
          />
        </div>
      )}
      <div className="qaimage-plus">
        <div className="qaimage-same-line">
          {questions.map((_, index) => (
            <span
              key={index}
              className={`qaimage-count ${
                currentQuestionIndex === index ? "active" : ""
              }`}
              onClick={() => handleQuestionSelect(index)}
            >
              {index + 1}
            </span>
          ))}
          <p className="qaimage-plus-sign" onClick={handleAddQuestion}>
            +
          </p>
        </div>
        <h2 className="qaimage-header">Max 5 questions</h2>
      </div>

      <div className="qaimage-input">
        <input
          type="text"
          placeholder="Poll Question"
          className="qaimage-input-box"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
      </div>

      <div className="qaimage-options">
        <div className="qaimage-option-type-para">
          <h2>Option Type</h2>
        </div>
        <div className="qaimage-options-type">
          <div className="qaimage-option-type-radio">
            <input
              type="radio"
              id="text"
              name="option"
              value="text"
              checked={selectedOption === "text"}
              onChange={handleOptionChange}
            />
            <label className="qaimage-option-text">Text</label>
          </div>
          <div className="qaimage-option-type-radio">
            <input
              type="radio"
              id="image-url"
              name="option"
              value="image-url"
              checked={selectedOption === "image-url"}
              onChange={handleOptionChange}
            />
            <label className="qaimage-option-image-text">Image URL</label>
          </div>
          <div className="qaimage-option-type-radio">
            <input
              type="radio"
              id="image-text"
              name="option"
              value="image-text"
              checked={selectedOption === "image-text"}
              onChange={handleOptionChange}
            />
            <label className="qaimage-option-text-image-url">
              Text & Image URL
            </label>
          </div>
        </div>
      </div>

      <div className="qaimage-ans-option">
        {imageUrls.map((url, index) => (
          <div
            key={index}
            className={`qaimage-option-container ${
              correctAnswerIndex === index ? "correct-answer" : ""
            }`}
            onClick={() => handleSelectCorrectAnswer(index)}
          >
            <input
              type="radio"
              name={`option-group-${currentQuestionIndex}`}
              className="qaimage-radio-button"
              onClick={() => handleSelectCorrectAnswer(index)}
            />
            <input
              key={index}
              type="text"
              placeholder="Image URL"
              className="qaimage-option"
              value={url}
              onChange={(e) => handleImageUrlChange(index, e.target.value)}
              style={getOptionStyle(index)}
            />
            {index >= 2 && (
              <FontAwesomeIcon
                icon={faTrash}
                className="qaimage-delete-icon"
                onClick={() => handleDeleteOption(index)}
              />
            )}
          </div>
        ))}
        <button className="qaimage-add-option-btn" onClick={handleAddOption}>
          Add Option
        </button>
      </div>

      <div className="qatext-timer-option">
        <h3 className="qatext-header-timer">Timer</h3>
        <button
          className={`qatext-timer-off ${selectedTimer === 0 ? "active" : ""}`}
          onClick={() => handleTimerChange(0)}
        >
          OFF
        </button>
        <button
          className={`qatext-five-sec ${selectedTimer === 5 ? "active" : ""}`}
          onClick={() => handleTimerChange(5)}
        >
          5 sec
        </button>
        <button
          className={`qatext-ten-sec ${selectedTimer === 10 ? "active" : ""}`}
          onClick={() => handleTimerChange(10)}
        >
          10 sec
        </button>
      </div>

      <div className="qaimage-cancel-continue-btn">
        <button className="qaimage-cancel-btn" onClick={onClose}>
          Cancel
        </button>
        <button className="qaimage-continue-btn" onClick={handleCreateQuiz}>
          Create Quiz
        </button>
      </div>
    </div>
  );
};

export default QAImage;

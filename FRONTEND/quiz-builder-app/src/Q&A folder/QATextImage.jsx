import React, { useState } from "react";
import "./QATextImage.css";
import { toast } from "react-toastify";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import QACongrats from "./QACongrats";

const QATextImage = ({ selectedOption, handleOptionChange, onClose }) => {
  const [questionText, setQuestionText] = useState(""); // State for the question text
  const [options, setOptions] = useState([
    { text: "", imageUrl: "" },
    { text: "", imageUrl: "" },
    { text: "", imageUrl: "" },
  ]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null);
  const [quizId, setQuizId] = useState(null);
  const [quizLink, setQuizLink] = useState("");
  const [showCongrats, setShowCongrats] = useState(false);
  const [quizPublished, setQuizPublished] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState(0); // Default to OFF (0 sec)
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null);

  const handleSelectCorrectAnswer = (index) => {
    setCorrectAnswerIndex(index);
  };

  const handleDelete = (index) => {
    // Remove option at index
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleAddOption = () => {
    setOptions([...options, { text: "", imageUrl: "" }]);
  };

  const handleOptionTextChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleAddQuestion = () => {
    if (questions.length >= 5) {
      toast.warning("You can't add a maximum of 5 questions.");
      return;
    }
    if (!questionText.trim()) {
      toast.warning("Please enter a question text.");
      return;
    }

    if (
      options.some((option) => !option.text.trim() || !option.imageUrl.trim())
    ) {
      toast.warning("Please enter valid image URLs or text for all options.");
      return;
    }
    const newQuestion = {
      questionText,
      options: [...options],
      correctAnswer: correctAnswerIndex,
    };

    setQuestions([...questions, newQuestion]);
    setQuestionText(""); // Clear the question text input
    setOptions([
      { text: "", imageUrl: "" },
      { text: "", imageUrl: "" },
      { text: "", imageUrl: "" },
    ]); // Clear the text and image URL inputs
    setCurrentQuestionIndex(questions.length); // Set the new question as the current question
    setCorrectAnswerIndex(null); // Reset correct answer selection
  };

  const handleQuestionSelect = (index) => {
    const selectedQuestion = questions[index];
    if (selectedQuestion) {
      setCurrentQuestionIndex(index);
      setQuestionText(selectedQuestion.questionText);
      setOptions(selectedQuestion.options);
    }
  };

  const handleCreateQuiz = async () => {
    const authToken = localStorage.getItem("auth-token");
    console.log("Auth Token:", authToken);

    if (!authToken) {
      toast.error("No authentication token found. Please log in.");
      return;
    }

    console.log("Raw Questions:", questions);

    // Ensure questions are properly filtered and included
    const filteredQuestions = questions
      .filter((question, index) => {
        console.log("Processing Question:", question);
        // Ensure questionText is a non-empty string
        const hasValidText =
          typeof question.questionText === "string" &&
          question.questionText.trim() !== "";
        // Ensure options are an array with at least one non-empty string
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
        console.log(
          `Question ${index + 1} Valid:`,
          hasValidText,
          hasValidOptions
        );
        return hasValidText && hasValidOptions && hasValidAnswer;
      })
      .map((question, index) => ({
        id: `question-${index + 1}`,

        questionText: question.questionText, // Include questionText
        options: question.options.map((option) => ({
          text: option.text, // Include text
          imageUrl: option.imageUrl,
        })),
        correctAnswer: question.correctAnswer,
        timer: question.timer || null,
      }));

    console.log("Filtered Questions:", filteredQuestions);

    const quizData = {
      title: "Q&A QUIZ",
      questionType: "Q&A",
      questions: filteredQuestions,
      timer: { value: selectedTimer },
    };

    console.log("Quiz Data Being Sent:", quizData);

    if (filteredQuestions.length === 0) {
      toast.error("At least one question is required.");
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

  const handleCloseCongrats = () => {
    setShowCongrats(false); // Close the PollCongrats component
  };

  const handleTimerChange = (timerValue) => {
    setSelectedTimer(timerValue);
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
    <div className="qatextimage-container">
      {showCongrats && (
        <div className="pollcongrats-overlay">
          <QACongrats
            quizLink={quizLink}
            quizId={quizId}
            onClose={handleCloseCongrats}
          />
        </div>
      )}
      <div className="qatextimage-plus">
        <div className="qatextimage-same-line">
          {questions.map((_, index) => (
            <span
              key={index}
              className={`qatextimage-count ${
                currentQuestionIndex === index ? "active" : ""
              }`}
              onClick={() => handleQuestionSelect(index)}
            >
              {index + 1}
            </span>
          ))}
          <p className="qatextimage-plus-sign" onClick={handleAddQuestion}>
            +
          </p>
        </div>
        <h2 className="qatextimage-header">Max 5 questions</h2>
      </div>

      <div className="qatextimage-input">
        <input
          type="text"
          placeholder="Poll Question"
          className="qatextimage-input-box"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
      </div>

      <div className="qatextimage-options">
        <div className="qatextimage-option-type-para">
          <h2>Option Type</h2>
        </div>
        <div className="qatextimage-options-type">
          <div className="qatextimage-option-type-radio">
            <input
              type="radio"
              id="text"
              name="option"
              checked={selectedOption === "text"}
              onChange={handleOptionChange}
            />
            <label className="qatextimage-option-text">Text</label>
          </div>
          <div className="qatextimage-option-type-radio">
            <input
              type="radio"
              id="image-url"
              name="option"
              checked={selectedOption === "image-url"}
              onChange={handleOptionChange}
            />
            <label className="qatextimage-option-image-text">Image URL</label>
          </div>
          <div className="qatextimage-option-type-radio">
            <input
              type="radio"
              id="image-text"
              name="option"
              checked={selectedOption === "image-text"}
              onChange={handleOptionChange}
            />
            <label className="qatextimage-option-text-image-url">
              Text & Image URL
            </label>
          </div>
        </div>
      </div>

      <div className="qatextimage-ans-option">
        {options.map((option, index) => (
          <div
            key={index}
            className={`qatextimage-option-textbox ${
              correctAnswerIndex === index ? "correct" : ""
            }`}
            onClick={() => handleSelectCorrectAnswer(index)}
          >
            <input
              type="radio"
              name={`option-group-${currentQuestionIndex}`}
              className="qatextimage-radio-button"
              onClick={() => handleSelectCorrectAnswer(index)}
            />
            <input
              type="text"
              placeholder="Text"
              className="qatextimage-first-option-text"
              value={option.text}
              onChange={(e) =>
                handleOptionTextChange(index, "text", e.target.value)
              }
              style={getOptionStyle(index)}
            />
            <input
              type="text"
              placeholder="Image url"
              className="qatextimage-first-option-image"
              value={option.imageUrl}
              onChange={(e) =>
                handleOptionTextChange(index, "imageUrl", e.target.value)
              }
              style={getOptionStyle(index)}
            />
            {index >= 2 && (
              <FontAwesomeIcon
                icon={faTrash}
                className="qatextimage-delete-btn"
                onClick={() => handleDelete(index)}
              />
            )}
          </div>
        ))}

        <button className="qatextimage-fourth-option" onClick={handleAddOption}>
          Add option
        </button>
      </div>

      <div className="qatextimage-timer-option">
        <h3 className="qatextimage-header-timer">Timer</h3>
        <button
          className={`qatextimage-timer-off ${
            selectedTimer === 0 ? "active" : ""
          }`}
          onClick={() => handleTimerChange(0)}
        >
          OFF
        </button>
        <button
          className={`qatextimage-five-sec ${
            selectedTimer === 5 ? "active" : ""
          }`}
          onClick={() => handleTimerChange(5)}
        >
          5 sec
        </button>
        <button
          className={`qatextimage-ten-sec ${
            selectedTimer === 10 ? "active" : ""
          }`}
          onClick={() => handleTimerChange(10)}
        >
          10 sec
        </button>
      </div>

      <div className="qatextimage-cancel-continue-btn">
        <button className="qatextimage-cancel-btn" onClick={onClose}>
          Cancel
        </button>
        <button className="qatextimage-continue-btn" onClick={handleCreateQuiz}>
          Create Quiz
        </button>
      </div>
    </div>
  );
};

export default QATextImage;

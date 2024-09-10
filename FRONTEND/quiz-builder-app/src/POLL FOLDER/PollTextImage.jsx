import React, { useState } from "react";
import "./Polltext&image.css";
import axios from "axios";
import { toast } from "react-toastify";
import PollCongrats from "./PollCongrats";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PollTextImage = ({
  quizTitle,
  selectedOption,
  handleOptionChange,
  onClose,
}) => {
  const [questionText, setQuestionText] = useState(""); // State for the question text
  const [options, setOptions] = useState([
    { text: "", imageUrl: "" },
    { text: "", imageUrl: "" },
    { text: "", imageUrl: "" },
    { text: "", imageUrl: "" },
  ]); // State for the text and image URLs
  const [questions, setQuestions] = useState([]); // State to store all the questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null); // State for tracking the current question
  const [quizLink, setQuizLink] = useState(""); // State to store the quiz link
  const [showCongrats, setShowCongrats] = useState(false);
  const [quizId, setQuizId] = useState(null); // Add this state to manage quizId
  const [quizPublished, setQuizPublished] = useState(false); // State to track if quiz is published
  const navigate = useNavigate(); // Initialize useNavigate

  const authToken = localStorage.getItem("auth-token");

  const handleQuizCreation = (newQuizId) => {
    setQuizId(newQuizId);
  };

  const handleClose = () => {
    navigate("/dashboard"); // Navigate back to the previous page
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
    };

    setQuestions([...questions, newQuestion]);
    setQuestionText(""); // Clear the question text input
    setOptions([
      { text: "", imageUrl: "" },
      { text: "", imageUrl: "" },
      { text: "", imageUrl: "" },
      { text: "", imageUrl: "" },
    ]); // Clear the text and image URL inputs
    setCurrentQuestionIndex(questions.length); // Set the new question as the current question
  };

  const handleQuestionSelect = (index) => {
    const selectedQuestion = questions[index];
    if (selectedQuestion) {
      setCurrentQuestionIndex(index);
      setQuestionText(selectedQuestion.questionText);
      setOptions(selectedQuestion.options);
    }
  };

  const handleOptionTextChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const handleCreateQuiz = async () => {
    const quizData = {
      title: "Poll Quiz",
      questionType: "POLL TYPE",
      questions: questions.map((question, index) => ({
        id: `question-${index + 1}`,
        questionText: question.questionText,
        options: question.options, // No need to include correctAnswer
        correctAnswer: "0",
      })),
    };

    console.log("Quiz Data Being Sent:", quizData); // Debugging

    try {
      const response = await axios.post(
        `${REACT_APP_API_BASE_URL}/api/quizzes/quiz/create`,
        quizData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const { data } = response;
      const createdQuizId = response.data.quizId;
      const frontendQuizLink = `http://localhost:3000/quiz/${createdQuizId}`;

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

  const removeQuestion = (indexToRemove) => {
    const newQuestions = questions.filter(
      (_, index) => index !== indexToRemove
    );
    setQuestions(newQuestions);
    if (currentQuestionIndex === indexToRemove && newQuestions.length > 0) {
      setCurrentQuestionIndex(
        indexToRemove === newQuestions.length
          ? indexToRemove - 1
          : indexToRemove
      );
    }
  };

  const removeOption = (indexToRemove) => {
    const newOptions = options.filter((_, index) => index !== indexToRemove);
    setOptions(newOptions);
  };

  return (
    <div className="polltextimage-container">
      {showCongrats && (
        <div className="pollcongrats-overlay">
          <PollCongrats
            quizLink={quizLink}
            quizId={quizId}
            onClose={handleCloseCongrats}
          />
        </div>
      )}
      <div className="polltextimage-plus">
        <div className="polltextimage-same-line">
          {questions.map((question, index) => (
            <div
              // key={index}
              key={question._id || index}
              className={`polltextimage-number-circle ${
                currentQuestionIndex === index ? "active" : ""
              }`}
              onClick={() => handleQuestionSelect(index)}
            >
              {index > 0 && (
                <span
                  className="cross-icon"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering parent click
                    removeQuestion(index);
                  }}
                >
                  &#10005; {/* Cross icon */}
                </span>
              )}
              {index + 1}
            </div>
          ))}
          <p className="polltextimage-plus-sign" onClick={handleAddQuestion}>
            +
          </p>
        </div>

        <h2 className="polltextimage-header">Max 5 questions</h2>
      </div>

      <div className="polltextimage-input">
        <input
          type="text"
          placeholder="Poll Question"
          className="polltextimage-input-box"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
      </div>

      <div className="polltextimage-options">
        <div className="polltextimage-option-type-para">
          <h2>Option Type</h2>
        </div>
        <div className="polltextimage-options-type">
          <div className="polltextimage-option-type-radio">
            <input
              type="radio"
              id="text"
              name="option"
              checked={selectedOption === "text"}
              onChange={handleOptionChange}
            />
            <label className="polltextimage-option-text">Text</label>
          </div>
          <div className="polltextimage-option-type-radio">
            <input
              type="radio"
              id="image-url"
              name="option"
              checked={selectedOption === "image-url"}
              onChange={handleOptionChange}
            />
            <label className="polltextimage-option-image-text">Image URL</label>
          </div>
          <div className="polltextimage-option-type-radio">
            <input
              type="radio"
              id="image-text"
              name="option"
              checked={selectedOption === "image-text"}
              onChange={handleOptionChange}
            />
            <label className="polltextimage-option-text-image-url">
              Text & Image URL
            </label>
          </div>
        </div>
      </div>

      <div className="polltextimage-ans-option">
        {options.map((option, index) => (
          <div key={index} className="polltextimage-option-textbox">
            <input
              type="text"
              placeholder="Text"
              className="polltextimage-first-option-text"
              value={option.text}
              onChange={(e) =>
                handleOptionTextChange(index, "text", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Image url"
              className="polltextimage-first-option-image"
              value={option.imageUrl}
              onChange={(e) =>
                handleOptionTextChange(index, "imageUrl", e.target.value)
              }
            />
            {index >= 2 && ( // Show trash icon from the third option
              <button
                className="polltextimage-delete-btn"
                onClick={() => removeOption(index)}
              >
                <FaTrash />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="polltextimage-cancel-continue-btn">
        <button className="polltextimage-cancel-btn" onClick={onClose}>
          Cancel
        </button>
        <button
          className="polltextimage-continue-btn"
          onClick={handleCreateQuiz}
        >
          Create Quiz
        </button>
      </div>
    </div>
  );
};

export default PollTextImage;

import React, { useState, useEffect } from "react";
import "./pollimage.css";
import axios from "axios";
import { toast } from "react-toastify";
import PollCongrats from "./PollCongrats";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PollImage = ({
  questionId,
  selectedOption,
  handleOptionChange,
  onClose,
  quiz,
}) => {
  const [questionText, setQuestionText] = useState(""); // State for the question text
  const [imageUrls, setImageUrls] = useState(["", "", "", ""]); // State for the 4 image URLs
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

    if (imageUrls.every((url) => !url.trim())) {
      toast.warning("Please enter valid image URLs for all options.");
      return;
    }
    const newQuestion = {
      questionText,
      options: imageUrls
        .map((url) => ({ imageUrl: url.trim() }))
        .filter((option) => option.imageUrl), // Remove empty URLs
    };

    if (newQuestion.options.length === 0) {
      toast.warning("Please enter at least one valid image URL.");
      return;
    }

    setQuestions([...questions, newQuestion]);
    setQuestionText(""); // Clear the question text input
    setImageUrls(["", "", "", ""]); // Clear the image URLs inputs
    setCurrentQuestionIndex(questions.length); // Set the new question as the current question
  };

  // Handle selecting a question by its number
  const handleQuestionSelect = (index) => {
    console.log("Question selected:", index + 1);
    const selectedQuestion = questions[index];
    if (selectedQuestion) {
      const selectedQuestion = questions[index];
      setCurrentQuestionIndex(index);
      setQuestionText(selectedQuestion.questionText);
      setImageUrls(selectedQuestion.options.map((option) => option.imageUrl));
    } else {
      console.log("undefined");
    }
  };

  // Function to handle the quiz creation
  const handleCreateQuiz = async () => {
    const authToken = localStorage.getItem("auth-token");
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
        `https://quiz-app-mern-0bj4.onrender.com/api/quizzes/quiz/create`,
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
      //setQuizId(response.data.quizId);
      setQuizId(createdQuizId);
      //setQuizLink(data.quizLink || "");
      setQuizLink(frontendQuizLink);
      setShowCongrats(true);
      setQuizPublished(true);
      toast.success("Quiz created successfully!");
    } catch (error) {
      toast.error("Failed to create quiz. Please try again.");
      console.error("Error details:", error.response?.data || error.message);
    }
  };

  // Handle image URL input change
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

  const handleDeleteOption = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  // Handle quiz data for editing
  useEffect(() => {
    if (quiz && quiz.questions && quiz.questions.length > 0) {
      setImageUrls(quiz.questions[0].options.map((option) => option.imageUrl));
      // Assuming you need to set the selectedOption here
      const selectedOptionUrl =
        quiz.questions[0].options.find((option) => option.isSelected)
          ?.imageUrl || "";
      handleOptionChange({ target: { value: selectedOptionUrl } });
    }
  }, [quiz]);

  return (
    <div className="pollimage-container">
      {showCongrats && (
        <div className="pollcongrats-overlay">
          <PollCongrats
            quizLink={quizLink}
            quizId={quizId}
            onClose={handleCloseCongrats}
          />
        </div>
      )}
      <div className="pollimage-plus">
        <div className="pollimage-same-line">
          {questions.map((question, index) => (
            <div
              // key={index}
              key={question._id || index}
              className={`pollimage-number-circle ${
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
          <p className="pollimage-plus-sign" onClick={handleAddQuestion}>
            +
          </p>
        </div>
        <h2 className="pollimage-header">Max 5 questions</h2>
      </div>

      <div className="pollimage-input">
        <input
          type="text"
          placeholder="Poll Question"
          className="pollimage-input-box"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
      </div>

      <div className="pollimage-options">
        <div className="pollimage-option-type-para">
          <h2>Option Type</h2>
        </div>
        <div className="pollimage-options-type">
          <div className="pollimage-option-type-radio">
            <input
              type="radio"
              id="text"
              name="option"
              checked={selectedOption === "text"}
              onChange={handleOptionChange}
            />
            <label className="pollimage-option-text">Text</label>
          </div>
          <div className="pollimage-option-type-radio">
            <input
              type="radio"
              id="image-url"
              name="option"
              checked={selectedOption === "image-url"}
              onChange={handleOptionChange}
            />
            <label className="pollimage-option-image-text">Image URL</label>
          </div>
          <div className="pollimage-option-type-radio">
            <input
              type="radio"
              id="image-text"
              name="option"
              checked={selectedOption === "image-text"}
              onChange={handleOptionChange}
            />
            <label className="pollimage-option-text-image-url">
              Text & Image URL
            </label>
          </div>
        </div>
      </div>

      <div className="pollimage-ans-option">
        {imageUrls.map((url, index) => (
          <div key={index} className="pollimage-option-wrapper">
            <input
              type="text"
              placeholder="Image URL"
              className="pollimage-option"
              value={url}
              onChange={(e) => handleImageUrlChange(index, e.target.value)}
            />

            {index >= 2 && (
              <button
                className="pollimage-delete-btn"
                onClick={() => handleDeleteOption(index)}
              >
                <FaTrash /> {/* Use FaTrash from react-icons */}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="pollimage-cancel-continue-btn">
        <button className="pollimage-cancel-btn" onClick={onClose}>
          Cancel
        </button>
        <button className="pollimage-continue-btn" onClick={handleCreateQuiz}>
          {/* Create Quiz */}
          {quiz ? "Save Changes" : "Create Quiz"}
        </button>
      </div>
    </div>
  );
};

export default PollImage;

import React, { useState, useEffect } from "react";
import "./polltext.css";
import PollImage from "./PollImage";
import PollTextImage from "./PollTextImage";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PollCongrats from "./PollCongrats";
import { FaTrash } from "react-icons/fa";

const PollText = ({ onClose, quiz }) => {
  const [selectedOption, setSelectedOption] = useState("text");
  const [questions, setQuestions] = useState([
    { _id: "", questionText: "", options: ["", "", "", ""], imageUrl: "" },
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track current question
  const [quizLink, setQuizLink] = useState(""); // For storing the generated quiz link
  const [quizPublished, setQuizPublished] = useState(false); // State to track if quiz is published
  const [showCongrats, setShowCongrats] = useState(false);
  const [quizId, setQuizId] = useState(null); // Add this state to manage quizId

  const handleQuizCreation = (newQuizId) => {
    setQuizId(newQuizId);
  };
  const handleOptionChange = (e) => {
    setSelectedOption(e.target.id);
  };

  const handleQuestionChange = (value) => {
    const newQuestions = [...questions];
    if (newQuestions[currentQuestionIndex]) {
      newQuestions[currentQuestionIndex].questionText = value;
      setQuestions(newQuestions);
    }
  };

  const handleOptionInputChange = (oIndex, value) => {
    const newQuestions = [...questions];
    if (newQuestions[currentQuestionIndex]) {
      newQuestions[currentQuestionIndex].options[oIndex] = value;
      setQuestions(newQuestions);
    }
  };

  const handleImageUrlSubmit = (imageUrl) => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].imageUrl = imageUrl;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    if (questions.length < 5) {
      if (
        questions[currentQuestionIndex] &&
        questions[currentQuestionIndex].questionText.trim() &&
        questions[currentQuestionIndex].options.every((opt) => opt.trim())
      ) {
        setQuestions([
          ...questions,
          {
            _id: "",
            questionText: "",
            options: ["", "", "", ""],
            correctAnswer: "",
            imageUrl: "",
          },
        ]);
        setCurrentQuestionIndex(questions.length);
      } else {
        toast.warning(
          "Please fill in the current question and options before adding a new one."
        );
      }
    } else {
      toast.warning("Cannot add more than 5 questions");
    }
  };

  const handleCreateQuiz = async () => {
    const authToken = localStorage.getItem("auth-token");
    console.log("Auth Token:", authToken); // Check token in console

    if (!authToken) {
      toast.error("No authentication token found. Please log in.");
      return;
    }
    // Filter out questions with empty questionText and options
    const filteredQuestions = questions
      .filter((question) => {
        // Ensure questionText is not empty and at least one option is valid
        const hasValidText = question.questionText.trim() !== "";
        const hasValidOptions = question.options.some(
          (option) => option.trim() !== ""
        );
        return hasValidText && hasValidOptions;
      })
      .map((question, index) => ({
        id: `question-${index + 1}`, // Adding a unique ID for each question
        questionText: question.questionText,
        options: question.options
          .filter((option) => option.trim() !== "") // Filter out empty options
          .map((option) => ({
            text: option, // Ensure option text is not empty
          })),
        correctAnswer: question.correctAnswer || null, // Set the correct answer if needed
      }));

    // Construct the quiz data
    const quizData = {
      title: "Poll Quiz",
      questionType: "POLL TYPE",
      questions: filteredQuestions, // Only include non-empty questions
    };

    console.log("Quiz Data Being Sent:", quizData); // Debugging
    console.log("Final Quiz Data:", quizData);
    try {
      const response = await axios.post(
        "https://quiz-builder-app-backend-1.onrender.com/api/quizzes/quiz/create",
        quizData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const createdQuizId = response.data.quizId;
      const frontendQuizLink = `http://localhost:3000/quiz/${createdQuizId}`; // Update with your frontend URL
      //setQuizId(response.data.quizId);
      setQuizId(createdQuizId);
      //setQuizLink(response.data.quizLink);
      setQuizLink(frontendQuizLink);
      setShowCongrats(true); // Show the congrats pop-up
      setQuizPublished(true);
      toast.success("Quiz created successfully!");
    } catch (error) {
      toast.error("Failed to create quiz. Please try again.");
      console.error("Error details:", error.response?.data || error.message);
    }
  };

  const handleCloseCongrats = () => {
    setShowCongrats(false); // Close the PollCongrats pop-up
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

  const handleDeleteOption = (oIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[currentQuestionIndex]) {
      newQuestions[currentQuestionIndex].options = newQuestions[
        currentQuestionIndex
      ].options.filter((_, index) => index !== oIndex);
      setQuestions(newQuestions);
    }
  };

  // Handle quiz data for editing
  useEffect(() => {
    if (quiz && quiz.questions) {
      setQuestions(
        quiz.questions.map((q) => ({
          _id: q._id || "",
          questionText: q.questionText || "",
          options: q.options.map((option) => option.text || ""), // Ensure options are strings
          imageUrl: q.imageUrl || "",
        }))
      );
    }
  }, [quiz]);

  return (
    <>
      {selectedOption === "image-url" ? (
        <PollImage
          selectedOption={selectedOption}
          handleOptionChange={handleOptionChange}
          onClose={onClose}
        />
      ) : selectedOption === "image-text" ? (
        <PollTextImage
          selectedOption={selectedOption}
          handleOptionChange={handleOptionChange}
          onClose={onClose}
        />
      ) : (
        <div className="polltext-container">
          <div className="polltext-plus-container">
            <div className="polltext-plus">
              <div className="polltext-numbers">
                {questions.map((question, index) => (
                  <div
                    // key={index}
                    key={question._id || index}
                    className={`polltext-number-circle ${
                      currentQuestionIndex === index ? "active" : ""
                    }`}
                    onClick={() => setCurrentQuestionIndex(index)}
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
              </div>
              <p className="polltext-plus-sign" onClick={addQuestion}>
                +
              </p>
            </div>

            <h2 className="polltext-header">Max 5 questions</h2>
          </div>

          <div className="polltext-question-block">
            <div className="polltext-input">
              <input
                type="text"
                placeholder={`Poll Question ${currentQuestionIndex + 1}`}
                className="polltext-input-box"
                value={questions[currentQuestionIndex].questionText}
                onChange={(e) => handleQuestionChange(e.target.value)}
              />
            </div>
          </div>

          <div className="polltext-same-line-option">
            <div className="polltext-option-type-para">
              <h2>Option Type</h2>
            </div>
            <div className="polltext-options-type">
              <div className="polltext-option-type-radio">
                <input
                  type="radio"
                  id="text"
                  name="option"
                  onChange={handleOptionChange}
                  checked={selectedOption === "text"}
                />
                <label className="polltext-option-text">Text</label>
              </div>
              <div className="polltext-option-type-radio">
                <input
                  type="radio"
                  id="image-url"
                  name="option"
                  onChange={handleOptionChange}
                  checked={selectedOption === "image-url"}
                />
                <label className="polltext-option-image-text">Image URL</label>
              </div>
              <div className="polltext-option-type-radio">
                <input
                  type="radio"
                  id="image-text"
                  name="option"
                  onChange={handleOptionChange}
                  checked={selectedOption === "image-text"}
                />
                <label className="polltext-option-text-image-url">
                  Text & Image URL
                </label>
              </div>
            </div>
          </div>

          {selectedOption === "image-url" ? (
            <div className="polltext-image-url-input">
              <input
                type="text"
                placeholder="Enter Image URL"
                value={questions[currentQuestionIndex].imageUrl}
                onChange={(e) => handleImageUrlSubmit(e.target.value)}
              />
            </div>
          ) : (
            <div className="polltext-options">
              {questions[currentQuestionIndex].options.map((option, oIndex) => (
                <div key={oIndex} className="polltext-option-wrapper">
                  <input
                    type="text"
                    placeholder="Text"
                    className="polltext-option"
                    value={option}
                    onChange={(e) =>
                      handleOptionInputChange(oIndex, e.target.value)
                    }
                  />
                  {oIndex >= 2 && (
                    <button
                      className="polltext-delete-btn"
                      onClick={() => handleDeleteOption(oIndex)}
                    >
                      <FaTrash /> {/* Use FaTrash from react-icons */}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="polltext-cancel-continue-btn">
            <button className="polltext-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              className="polltext-continue-btn"
              onClick={handleCreateQuiz}
            >
              {/* Create Quiz */}
              {quiz ? "Save Changes" : "Create Quiz"}
            </button>
          </div>

          {showCongrats && (
            <PollCongrats
              quizId={quizId}
              quizLink={quizLink}
              onClose={handleCloseCongrats}
              onShare={handleShareQuizLink}
            />
          )}
        </div>
      )}
      <ToastContainer />
    </>
  );
};

export default PollText;

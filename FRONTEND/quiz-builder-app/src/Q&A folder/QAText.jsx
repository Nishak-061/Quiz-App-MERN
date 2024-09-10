import React, { useState } from "react";
import "./QAText.css";
import QAImage from "./QAImage";
import QATextImage from "./QATextImage";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import QACongrats from "./QACongrats";

const QAText = ({ onClose }) => {
  const [selectedOption, setSelectedOption] = useState("text");
  const [questions, setQuestions] = useState([
    {
      _id: "",
      text: "",
      options: ["", "", ""],
      timer: 0,
      imageUrl: "",
      correctAnswer: null,
    },
  ]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track current question
  const [quizLink, setQuizLink] = useState(""); // For storing the generated quiz link
  const [quizPublished, setQuizPublished] = useState(false); // State to track if quiz is published
  const [showCongrats, setShowCongrats] = useState(false);
  const [quizId, setQuizId] = useState(null); // Add this state to manage quizId
  const [selectedTimer, setSelectedTimer] = useState(0); // Default to OFF (0 sec)
  const [selectedCorrectOption, setSelectedCorrectOption] = useState(null);

  // Function to remove a question
  const handleDeleteQuestion = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions.splice(qIndex, 1);
    setQuestions(newQuestions);

    // Adjust the current question index if needed
    if (qIndex <= currentQuestionIndex && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.id);
  };

  const handleQuestionChange = (value) => {
    const newQuestions = [...questions];
    newQuestions[currentQuestionIndex].text = value;
    setQuestions(newQuestions);
  };

  const handleOptionInputChange = (oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[currentQuestionIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleAddOption = () => {
    const newQuestions = [...questions];
    if (newQuestions[currentQuestionIndex].options.length < 5) {
      newQuestions[currentQuestionIndex].options.push("");
      setQuestions(newQuestions);
    }
  };

  const handleDeleteOption = (indexToDelete) => {
    const newQuestions = [...questions];
    newQuestions[currentQuestionIndex].options.splice(indexToDelete, 1);
    setQuestions(newQuestions);
  };

  const handleTimerChange = (time) => {
    setSelectedTimer(time);

    // Set the timer for the current question
    const newQuestions = [...questions];
    newQuestions[currentQuestionIndex].timer = time;
    setQuestions(newQuestions);
  };

  const handleImageUrlSubmit = (imageUrl) => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].imageUrl = imageUrl;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    if (questions.length < 5) {
      if (
        questions[currentQuestionIndex].text.trim() &&
        questions[currentQuestionIndex].options.some((opt) => opt.trim())
      ) {
        setQuestions([
          ...questions,
          {
            _id: "",
            text: "",
            options: ["", "", "", ""],
            timer: 0,
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
    console.log("Auth Token:", authToken);

    if (!authToken) {
      toast.error("No authentication token found. Please log in.");
      return;
    }

    // Ensure questions are properly filtered and included
    const filteredQuestions = questions
      .filter((question) => {
        const hasValidText = question.text?.trim() !== ""; // Note the field name is `text`
        const hasValidOptions = question.options.some(
          (option) => option.trim() !== "" // Check if option is non-empty
        );
        const hasValidCorrectAnswer =
          Number.isInteger(question.correctAnswer) &&
          question.correctAnswer >= 0 &&
          question.correctAnswer < question.options.length;
        return hasValidText && hasValidOptions && hasValidCorrectAnswer;
      })
      .map((question, index) => ({
        id: `question-${index + 1}`,
        questionText: question.text, // Field name `text` should match
        options: question.options
          .filter((option) => option.trim() !== "") // Filter out empty options
          .map((option) => ({
            text: option, // Ensure option text is not empty
            // imageUrl: question.imageUrl || "" // Optional: Include imageUrl if available
          })),
        correctAnswer: question.correctAnswer, // Set correctAnswer if applicable
        timer: question.timer || null,
      }));

    //Construct the quiz data
    const quizData = {
      title: "Q&A Quiz", // Use actual quizTitle
      // questionType: selectedOption, // Ensure this matches the valid types
      questionType: "Q&A",
      questions: filteredQuestions,
      timer: { value: selectedTimer },
    };

    console.log("Filtered Questions:", filteredQuestions);
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

  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correctAnswer = optionIndex;
    setQuestions(updatedQuestions);
    setSelectedCorrectOption(optionIndex); // Update state to reflect the correct option
  };

  // Get the style for each option, applying green background for the correct option
  const getOptionStyle = (index) => {
    return {
      backgroundColor: index === selectedCorrectOption ? "#60B84B" : "white",
      color: index === selectedCorrectOption ? "white" : "black",
      padding: "10px",
      borderRadius: "5px",
      marginBottom: "10px",
      cursor: "pointer",
    };
  };

  const handleCorrectOptionSelect = (oIndex) => {
    handleCorrectAnswerChange(currentQuestionIndex, oIndex);
  };

  return (
    <>
      {selectedOption === "image-url" ? (
        <QAImage
          selectedOption={selectedOption}
          handleOptionChange={handleOptionChange}
          handleImageUrlSubmit={handleImageUrlSubmit}
          onClose={onClose}
        />
      ) : selectedOption === "image-text" ? (
        <QATextImage
          selectedOption={selectedOption}
          handleOptionChange={handleOptionChange}
          handleImageUrlSubmit={handleImageUrlSubmit}
          onClose={onClose}
        />
      ) : (
        <div className="qatext-container">
          <div className="qatext-plus-container">
            <div className="qatext-plus">
              <div className="qatext-numbers">
                {questions.map((question, index) => (
                  <div
                    key={question._id || index}
                    className={`qatext-number-circle ${
                      currentQuestionIndex === index ? "active" : ""
                    }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                    {index >= 1 && (
                      <span
                        className="cross-icon"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering parent click
                          console.log("Question ID:", question._id);
                          handleDeleteQuestion(index);
                        }}
                      >
                        &#10005; {/* Cross icon */}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <p className="qatext-plus-sign" onClick={addQuestion}>
                +
              </p>
            </div>

            <h2 className="qatext-header">Max 5 questions</h2>
          </div>

          <div className="qatext-question-block">
            <div className="qatext-input">
              <input
                type="text"
                placeholder={`Question ${currentQuestionIndex + 1}`}
                className="qatext-input-box"
                value={questions[currentQuestionIndex].text}
                onChange={(e) => handleQuestionChange(e.target.value)}
              />
            </div>
          </div>

          <div className="qatext-same-line-option">
            <div className="qatext-option-type-para">
              <h2>Option Type</h2>
            </div>
            <div className="qatext-options-type">
              <div className="qatext-option-type-radio">
                <input
                  type="radio"
                  id="text"
                  name="option"
                  onChange={handleOptionChange}
                  checked={selectedOption === "text"}
                />
                <label className="qatext-option-text">Text</label>
              </div>
              <div className="qatext-option-type-radio">
                <input
                  type="radio"
                  id="image-url"
                  name="option"
                  onChange={handleOptionChange}
                  checked={selectedOption === "image-url"}
                />
                <label className="qatext-option-image-text">Image URL</label>
              </div>
              <div className="qatext-option-type-radio">
                <input
                  type="radio"
                  id="image-text"
                  name="option"
                  onChange={handleOptionChange}
                  checked={selectedOption === "image-text"}
                />
                <label className="qatext-option-text-image-url">
                  Text & Image URL
                </label>
              </div>
            </div>
          </div>

          {selectedOption === "image-url" ? (
            <div className="qatext-image-url-input">
              <input
                type="text"
                placeholder="Enter Image URL"
                value={questions[currentQuestionIndex].imageUrl}
                onChange={(e) => handleImageUrlSubmit(e.target.value)}
              />
            </div>
          ) : (
            <div className="qatext-options">
              {questions[currentQuestionIndex].options.map((option, oIndex) => (
                <div
                  key={oIndex}
                  className="qatext-option-wrapper"
                  onClick={() => handleCorrectOptionSelect(oIndex)}
                >
                  {/* Add the radio button here */}
                  <input
                    type="radio"
                    name={`option-group-${currentQuestionIndex}`}
                    className="qatext-radio-button"
                    onClick={() => handleCorrectOptionSelect(oIndex)}
                  />
                  <input
                    type="text"
                    placeholder={`Text`}
                    className={`qatextbox-option qatext-option-${oIndex + 1}`}
                    value={option}
                    onChange={(e) =>
                      handleOptionInputChange(oIndex, e.target.value)
                    }
                    style={getOptionStyle(oIndex)}
                  />

                  {oIndex >= 2 && (
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="qatext-delete-option"
                      onClick={() => handleDeleteOption(oIndex)}
                    />
                  )}
                </div>
              ))}

              <button
                className="qatext-add-option-btn"
                onClick={handleAddOption}
              >
                Add Option
              </button>
            </div>
          )}

          <div className="qatext-timer-option">
            <h3 className="qatext-header-timer">Timer</h3>
            <button
              className={`qatext-timer-off ${
                selectedTimer === 0 ? "active" : ""
              }`}
              onClick={() => handleTimerChange(0)}
            >
              OFF
            </button>
            <button
              className={`qatext-five-sec ${
                selectedTimer === 5 ? "active" : ""
              }`}
              onClick={() => handleTimerChange(5)}
            >
              5 sec
            </button>
            <button
              className={`qatext-ten-sec ${
                selectedTimer === 10 ? "active" : ""
              }`}
              onClick={() => handleTimerChange(10)}
            >
              10 sec
            </button>
          </div>

          <div className="qatext-cancel-continue-btn">
            <button className="qatext-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="qatext-continue-btn" onClick={handleCreateQuiz}>
              Create Quiz
            </button>
          </div>

          {showCongrats && (
            <QACongrats
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

export default QAText;

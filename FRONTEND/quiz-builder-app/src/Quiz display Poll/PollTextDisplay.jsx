import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./polltextdisplay.css";

const PollTextDisplay = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      console.log(`Fetching quiz with ID: ${quizId}`);
      if (!quizId) {
        console.error("No quizId provided");
        return;
      }

      try {
        const response = await axios.get(
          `https://quiz-app-mern-0bj4.onrender.com/api/quizzes/quiz/${quizId}`
        );
        console.log("Quiz fetched successfully:", response.data);
        setQuiz(response.data.quiz);

        try {
          console.log(`Incrementing impression for quiz ID: ${quizId}`);
          await axios.post(
            `https://quiz-app-mern-0bj4.onrender.com/api/quizzes/quiz/${quizId}/impression`
          );
          console.log("Impression incremented successfully");
        } catch (impressionError) {
          console.error(
            "Error incrementing impression:",
            impressionError.response
              ? impressionError.response.data
              : impressionError.message
          );
        }
      } catch (error) {
        console.error(
          "Error fetching quiz:",
          error.response ? error.response.data : error.message
        );
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handleSubmit = async () => {
    const formattedAnswers = Object.keys(answers).map((questionId) => ({
      questionId,
      selectedOptions: [answers[questionId]], // Send the option ID
    }));

    console.log("Formatted Answers:", formattedAnswers); // Log formatted answers before submitting

    try {
      await axios.post(
        `https://quiz-app-mern-0bj4.onrender.com/api/quizzes/quiz/${quizId}/submit`,
        { answers: formattedAnswers }
      );
      setSubmitted(true);
      navigate("/participate-poll");
    } catch (error) {
      console.error(
        "Error submitting answers:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const allQuestionsAnswered = quiz?.questions.every(
    (question) => answers[question._id] !== undefined
  );

  if (!quiz) return <div>Loading...</div>;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;

  return (
    <div className="poll-text-display-container">
      <div className="polltext-display-body">
        <div className="polltext-display-question-progress">
          <p>{`0${currentQuestionIndex + 1} / 0${totalQuestions}`}</p>
        </div>

        <div
          key={currentQuestion._id}
          className="polltext-display-question-block"
        >
          <h2 className="polltext-display-question-header">
            {currentQuestion.questionText}
          </h2>
          <div className="polltext-display-options">
            {currentQuestion.options.map((option, index) => (
              <label
                key={option._id}
                className={`polltext-display-option-label ${
                  answers[currentQuestion._id] === option._id
                    ? "selected-option"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion._id}`}
                  value={option._id}
                  checked={answers[currentQuestion._id] === option._id}
                  onChange={() =>
                    handleAnswerChange(currentQuestion._id, option._id)
                  }
                  className="polltext-radio-hidden"
                />

                <div className="polltext-display-option-content">
                  {option.imageUrl && (
                    <img
                      src={option.imageUrl}
                      alt={`Option ${index + 1}`}
                      className="polltext-display-option-image"
                    />
                  )}
                  {option.text && (
                    <p className="polltext-display-option-text">
                      {option.text}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
        {currentQuestionIndex < quiz.questions.length - 1 ? (
          <div className="polltext-display-next-submit-container">
            <button onClick={handleNext} className="polltext-display-next-btn">
              Next
            </button>
          </div>
        ) : (
          <div className="polltext-display-next-submit-container">
            <button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || submitted}
              className="polltext-display-submit-btn"
            >
              {submitted ? "Submitted" : "Submit"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollTextDisplay;

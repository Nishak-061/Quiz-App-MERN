import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./qatextdisplay.css"; // Add your custom CSS here

const QATextDisplay = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // To track the current question
  const intervalRef = useRef(null);

  useEffect(() => {
    console.log("QATextDisplay rendered");
    const fetchQuiz = async () => {
      console.log(`Fetching quiz with ID: ${quizId}`);
      if (!quizId) {
        console.error("No quizId provided");
        return;
      }

      try {
        const response = await axios.get(
          `${REACT_APP_API_BASE_URL}/api/quizzes/quiz/${quizId}`
        );
        console.log("Quiz fetched successfully:", response.data);
        setQuiz(response.data.quiz);
        const fetchedTimer = response.data.quiz.timer?.value || 0;
        setTimer(fetchedTimer);
        console.log("Fetched quiz timer value:", fetchedTimer);

        // Record impression here
        await axios.post(
          `${REACT_APP_API_BASE_URL}/api/quizzes/quiz/${quizId}/impression`
        );
      } catch (error) {
        console.error(
          "Error fetching quiz:",
          error.response ? error.response.data : error.message
        );
      }
    };

    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(intervalRef.current);
            handleSubmit(); // Automatically submit when timer hits zero
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [timer]);

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
      selectedOptions: [answers[questionId]], // Assuming single option per question
    }));

    try {
      const response = await axios.post(
        `${REACT_APP_API_BASE_URL}/api/quizzes/quiz/${quizId}/submit`,
        {
          answers: formattedAnswers,
        }
      );

      const correctAnswersCount = quiz.questions.reduce((count, question) => {
        const submittedAnswer = answers[question._id];
        const correctAnswerIndex = question.correctAnswer;
        const correctOption = question.options[correctAnswerIndex];
        if (submittedAnswer === correctOption._id) {
          return count + 1;
        }
        return count;
      }, 0);

      // Navigate to CongratsQuiz and pass the score as state
      navigate("/congrats-quiz", {
        state: {
          score: correctAnswersCount,
          totalQuestions: quiz.questions.length,
        },
      });

      console.log("Response:", response.data);
      setSubmitted(true);
    } catch (error) {
      console.error(
        "Error submitting answers:",
        error.response ? error.response.data : error.message
      );
    }
  };

  if (!quiz) return <div>Loading...</div>;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const allQuestionsAnswered = quiz?.questions.every(
    (question) => answers[question._id] !== undefined
  );

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  return (
    <div className="qatext-display-container">
      <div className="qa-text-display-body">
        {quiz.timer && quiz.timer.value > 0 && (
          <div className="qatext-display-timer">
            <p className="qatext-display-timer-para"> {formatTime(timer)}s</p>
          </div>
        )}
        <div className="qatext-display-question-progress">
          {`${currentQuestionIndex + 1}/${quiz.questions.length}`}
        </div>
        <div
          key={currentQuestion._id}
          className="qatext-display-question-block"
        >
          <h2 className="qatext-display-question-header">
            {currentQuestion.questionText}
          </h2>

          <div className="qatext-display-options">
            {currentQuestion.options.map((option) => {
              const isOnlyImage = !option.text && option.imageUrl; // Only image, no text
              const isOnlyText = option.text && !option.imageUrl; // Only text, no image

              return (
                <label
                  key={option._id}
                  className={`qatext-display-option-label ${
                    isOnlyImage ? "only-image" : ""
                  } ${
                    answers[currentQuestion._id] === option._id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    handleAnswerChange(currentQuestion._id, option._id)
                  }
                >
                  {/* Show text if available */}
                  {option.text && (
                    <p className="qatext-display-option-para">{option.text}</p>
                  )}

                  {/* Show image if available and it's not text-only */}
                  {option.imageUrl && !isOnlyText && (
                    <img
                      src={option.imageUrl}
                      alt={`Option ${option._id}`}
                      className="qatext-display-images"
                    />
                  )}
                </label>
              );
            })}
          </div>
        </div>
        {currentQuestionIndex < quiz.questions.length - 1 ? (
          <div className="qatext-display-next-submit-container">
            <button onClick={handleNext} className="qatext-display-next-btn">
              NEXT
            </button>
          </div>
        ) : (
          <div className="qatext-display-next-submit-container">
            <button
              onClick={handleSubmit}
              disabled={submitted}
              className="qatext-display-submit-btn"
            >
              {submitted ? "Submitted" : "SUBMIT"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QATextDisplay;

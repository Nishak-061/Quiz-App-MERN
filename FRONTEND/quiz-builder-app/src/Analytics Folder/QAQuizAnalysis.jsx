import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./qaquizanalysis.css"; // Ensure you import the CSS file with sidebar styles

const QAQuizAnalysis = () => {
  const { quizId } = useParams();
  const [quizData, setQuizData] = useState(null);
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState(null);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await axios.get(
          `https://quiz-app-mern-0bj4.onrender.com/api/quizzes/quiz/${quizId}`
        );
        setQuizData(response.data.quiz || {});
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      }
    };
    fetchQuizData();
  }, [quizId]);

  const handleClickItem = (item) => {
    setActiveItem(item);
    if (item === "createQuiz") {
      setIsCreateQuizOpen(true);
    }
  };

  const handleItemClick = (index) => {
    setActiveItem(index);
    if (index === "analytics") {
      navigate("/analytics");
    }
  };

  const handleLogout = () => {
    // Clear the token from local storage
    localStorage.removeItem("auth-token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    // Redirect to login page
    navigate("/");
  };

  if (!quizData) return <p>Loading...</p>;

  return (
    <div className="qa-quiz-analysis-container">
      <div className="qa-quiz-analysis-sidebar">
        <div className="qa-quiz-analysis-sidebar-header">QUIZZIE</div>

        <div className="qa-quiz-analysis-middle-content">
          <h1
            className={`qa-quiz-analysis-dashboard-item ${
              activeItem === "dashboard" ? "active" : ""
            }`}
            onClick={() => handleItemClick("dashboard")}
          >
            Dashboard
          </h1>
          <h1
            className={`qa-quiz-analysis-analytics-item ${
              activeItem === "analytics" ? "active" : ""
            }`}
            onClick={() => handleItemClick("dashboard")}
          >
            Analytics
          </h1>
          <h1
            className={`qa-quiz-analysis-createquiz-item ${
              activeItem === "createQuiz" ? "active" : ""
            }`}
            onClick={() => handleClickItem("createQuiz")}
          >
            Create Quiz
          </h1>
          <div className="qa-quiz-analysis-logout" onClick={handleLogout}>
            <hr className="qa-quiz-horizontal-line" />
            <h1>LOGOUT</h1>
          </div>
        </div>
      </div>

      <div className="qa-quiz-analysis-main-content">
        <div className="qa-quiz-analysis-info">
          <h2>
            Created on:{" "}
            {new Date(quizData.createdAt)
              .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
              .replace(/(\d{2})\s(\w{4})/, "$1 $2,")}
          </h2>
          <h2 className="qa-quiz-analysis-impression">
            Impressions: {quizData.impressions}
          </h2>
        </div>
        <h1 className="qa-quiz-analysis-heading-title">Q&A Quiz Analysis</h1>
        {quizData.questions && quizData.questions.length > 0 ? (
          quizData.questions.map((question, index) => {
            const totalAttempts = question.options.reduce(
              (sum, option) => sum + option.clicks,
              0
            );
            const correctAttempts =
              question.options[question.correctAnswer]?.clicks || 0;
            const incorrectAttempts = totalAttempts - correctAttempts;

            return (
              <div key={question._id} className="question-section">
                <h2 className="qa-quiz-analysis-question-heading-section">
                  Q.{index + 1} {question.questionText}
                </h2>
                <div className="qa-quiz-analysis-answer-box-container">
                  <div className="answer-box">
                    <span className="answer-number">{totalAttempts}</span>{" "}
                    <br />
                    <span className="answer-number-text">
                      people attempt the question
                    </span>
                  </div>
                  <div className="answer-box">
                    <span className="answer-number"> {correctAttempts}</span>
                    <br />
                    <span className="answer-number-text">
                      people Answered Correctly
                    </span>
                  </div>
                  <div className="answer-box">
                    <span className="answer-number">{incorrectAttempts}</span>
                    <br />
                    <span className="answer-number-text">
                      people Answered Incorrectly
                    </span>
                  </div>
                </div>

                {/* <ul className="qaquizanalysis-ul">
                  {question.options.map((option, optIndex) => (
                    <li key={optIndex} className="qaquizanalysis-li">
                      {option.text} - {option.clicks} attempts
                    </li>
                  ))}
                </ul> */}
                {index < quizData.questions.length - 1 && (
                  <hr className="question-separator" />
                )}
              </div>
            );
          })
        ) : (
          <p>No questions found</p>
        )}
      </div>
    </div>
  );
};

export default QAQuizAnalysis;

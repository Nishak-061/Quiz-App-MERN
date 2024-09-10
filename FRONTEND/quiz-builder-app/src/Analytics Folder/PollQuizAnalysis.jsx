import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./pollquizanalysis.css"; // Ensure you import your CSS file

const PollQuizAnalysis = () => {
  const { quizId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [quizData, setQuizData] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `${REACT_APP_API_BASE_URL}/api/quizzes/quiz/${quizId}`
        );
        // setQuestions(response.data.questions || []);
        setQuizData(response.data.quiz || {});
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };
    fetchQuestions();
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
    <div className="poll-quiz-analysis-container">
      <div className="poll-quiz-analysis-sidebar">
        <div className="poll-quiz-analysis-sidebar-header">QUIZZIE</div>
        <div className="poll-quiz-analysis-middle-content">
          <h1
            className={`poll-quiz-analysis-dashboard-item ${
              activeItem === "dashboard" ? "active" : ""
            }`}
            onClick={() => handleItemClick("dashboard")}
          >
            Dashboard
          </h1>
          <h1
            className={`poll-quiz-analysis-analytics-item ${
              activeItem === "analytics" ? "active" : ""
            }`}
            onClick={() => handleItemClick("analytics")}
          >
            Analytics
          </h1>
          <h1
            className={`poll-quiz-analysis-createquiz-item ${
              activeItem === "createQuiz" ? "active" : ""
            }`}
            onClick={() => handleClickItem("createQuiz")}
          >
            Create Quiz
          </h1>

          <div className="logout" onClick={handleLogout}>
            <hr className="poll-quiz-analysis-horizontal-line" />
            <h1 className="poll-quiz-analysis-logout">LOGOUT</h1>
          </div>
        </div>
      </div>

      <div className="poll-quiz-analysis-main-content">
        <div className="poll-quiz-analysis-info">
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

          <h2 className="poll-quiz-analysis-impression">
            Impressions: {quizData.impressions}
          </h2>
        </div>

        <h1 className="poll-quiz-analysis-heading-title">Poll Quiz Analysis</h1>
        {quizData.questions && quizData.questions.length > 0 ? (
          quizData.questions.map((question, index) => (
            <div key={question._id} className="question-section">
              <h2 className="poll-quiz-analysis-question-heading-section">
                Q.{index + 1} {question.questionText}
              </h2>
              <ul className="pollquizanalysis-ul">
                {question.options.map((option, index) => (
                  <li key={option._id} className="pollquizanalysis-li">
                    <span className="option-clicks">{option.clicks}</span>
                    <span className="option-text"> Option {index + 1}</span>
                  </li>
                ))}
              </ul>
              {index < quizData.questions.length - 1 && (
                <hr className="question-separator" />
              )}{" "}
              {/* Only add <hr> if it's not the last question */}
            </div>
          ))
        ) : (
          <p>No questions found</p>
        )}
      </div>
    </div>
  );
};

export default PollQuizAnalysis;

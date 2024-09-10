import React, { useEffect, useState } from "react";
import "./dashboard.css";
import CreateQuiz from "../Create Quiz/CreateQuiz";
import { useNavigate, useParams } from "react-router-dom";
import { LuEye } from "react-icons/lu";
import axios from "axios";

const Dashboard = () => {
  const [activeItem, setActiveItem] = useState(null);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);
  const [quizCount, setQuizCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [impressionCount, setImpressionCount] = useState(0);
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  // Function to format numbers
  const formatNumber = (number) => {
    if (number >= 1_000_000) {
      return `${(number / 1_000_000).toFixed(1)}M`;
    } else if (number >= 1_000) {
      return `${(number / 1_000).toFixed(1)}k`;
    } else {
      return number;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    const formatter = new Intl.DateTimeFormat("en-GB", options);
    const parts = formatter.formatToParts(date);

    const day = parts.find((part) => part.type === "day").value;
    const month = parts.find((part) => part.type === "month").value;
    const year = parts.find((part) => part.type === "year").value;

    return `${day} ${month}, ${year}`;
  };

  useEffect(() => {
    // Function to fetch quiz count
    const fetchQuizCount = async () => {
      try {
        const authToken = localStorage.getItem("auth-token");
        const response = await axios.get(
          "https://quiz-builder-app-backend-1.onrender.com/api/quizzes/count",
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        setQuizCount(response.data.count);
      } catch (error) {
        console.error("Error fetching quiz count:", error);
      }
    };

    // Function to fetch question count
    const fetchQuestionCount = async () => {
      try {
        const authToken = localStorage.getItem("auth-token");
        const response = await axios.get(
          "https://quiz-builder-app-backend-1.onrender.com/api/quizzes/questions/count",
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        setQuestionCount(response.data.count);
      } catch (error) {
        console.error("Error fetching question count:", error);
      }
    };

    // Function to fetch impression count
    const fetchImpressionCount = async () => {
      try {
        const authToken = localStorage.getItem("auth-token");
        const response = await axios.get(
          "https://quiz-builder-app-backend-1.onrender.com/api/quizzes/impressions/count",
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        setImpressionCount(response.data.count);
      } catch (error) {
        console.error("Error fetching impression count:", error);
      }
    };

    // Fetch Trending Quizzes (Same as in Analytics)
    const fetchTrendingQuizzes = async () => {
      try {
        const response = await axios.get(
          "https://quiz-builder-app-backend-1.onrender.com/api/quizzes/analytics"
        );
        setQuizzes(response.data.quizzes || []);
      } catch (error) {
        console.error("Error fetching trending quizzes:", error);
      }
    };

    // Fetch all counts
    const fetchCounts = async () => {
      await Promise.all([
        fetchQuizCount(),
        fetchQuestionCount(),
        fetchImpressionCount(),
        fetchTrendingQuizzes(), // Fetch trending quizzes
      ]);
    };

    fetchCounts();
  }, []);

  const handleItemClick = (index) => {
    setActiveItem(index);
    if (index === "analytics") {
      navigate("/analytics");
    }
  };

  const handleClickItem = (item) => {
    setActiveItem(item);
    if (item === "createQuiz") {
      setIsCreateQuizOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsCreateQuizOpen(false);
  };

  const handleLogout = () => {
    // Clear the token from local storage
    localStorage.removeItem("auth-token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    // Redirect to login page
    navigate("/");
  };

  return (
    <div className="main-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>QUIZZIE</h1>
        </div>

        <div className="middle-content">
          <h1
            className={`middle-content-dashboard item ${
              activeItem === "dashboard" ? "active" : ""
            }`}
            onClick={() => handleItemClick("dashboard")}
          >
            Dashboard
          </h1>
          <h1
            className={`middle-content-analytics item ${
              activeItem === "analytics" ? "active" : ""
            }`}
            onClick={() => handleItemClick("analytics")}
          >
            Analytics
          </h1>
          <h1
            className={`middle-content-createquiz item ${
              activeItem === "createQuiz" ? "active" : ""
            }`}
            onClick={() => handleClickItem("createQuiz")}
          >
            Create Quiz
          </h1>
        </div>

        <div className="logout" onClick={handleLogout}>
          <hr className="horizontal-line" />
          <h1>LOGOUT</h1>
        </div>
      </div>
      <div className="main-content">
        <div className="box-container">
          <div className="box dashboard-quizzes-color">
            <span className="dashboard-quiz-count">{quizCount}</span>
            <span className="dashboard-text-quizzes">
              Quiz <br /> Created
            </span>
          </div>
          <div className="box dashboard-questions-color">
            <span className="dashboard-question-count">{questionCount}</span>

            <span className="dashboard-text-questions">
              {" "}
              Questions
              <br /> Created
            </span>
          </div>
          <div className="box dashboard-impression-color">
            <span className="dashboard-impression-count">
              {formatNumber(impressionCount)}
            </span>
            <br />
            <span className="dashboard-text-impressions">
              Total Impressions
            </span>
          </div>
        </div>

        <div className="dashboard-trending-quiz">
          <h2 className="dashboard-trending-heading">Trending Quizs</h2>
          <div className="trending-quiz-boxes">
            {quizzes.map((quiz, index) => (
              <div key={quiz.id || index} className="quiz-box">
                <div className="dashboard-quiz-header">
                  <h3 className="dashboard-quiz-title">{quiz.title} </h3>
                  <p className="dashboard-quiz-impressions">
                    {" "}
                    {quiz.impressions} <LuEye />
                  </p>{" "}
                  {/* Ensure you're using 'impressions' here */}
                </div>
                <p className="dashboard-quiz-date">
                  Created on: {formatDate(quiz.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {isCreateQuizOpen && (
        // <div className="modal" onClick={handleCloseModal}>
        //   <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        //   </div>
        // </div>
        <CreateQuiz onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateQuiz from "../Create Quiz/CreateQuiz";
import "./analytics.css";
import axios from "axios";
import { FaEdit, FaTrash, FaShareAlt } from "react-icons/fa";
import DeleteModal from "./DeleteModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PollQuizAnalysis from "./PollQuizAnalysis";
import QAQuizAnalysis from "./QAQuizAnalysis";
import PollText from "../POLL FOLDER/PollText";
import PollImage from "../POLL FOLDER/PollImage";
import PollTextImage from "../POLL FOLDER/PollTextImage";
import QAText from "../Q&A folder/QAText";
import QAImage from "../Q&A folder/QAImage";
import QATextImage from "../Q&A folder/QATextImage";

const Analytics = () => {
  const [activeItem, setActiveItem] = useState(null);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [deleteQuizId, setDeleteQuizId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPollQuizAnalysis, setShowPollQuizAnalysis] = useState(false);
  const [showQAQuizAnalysis, setShowQAQuizAnalysis] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // New state
  const [editQuiz, setEditQuiz] = useState(null); // New state
  const navigate = useNavigate();

  //original one dont delete it
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get(
          "https://quiz-app-mern-0bj4.onrender.com/api/quizzes/analytics"
        );
        setQuizzes(response.data.quizzes || []);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };
    fetchQuizzes();
  }, []);



  const handleShare = (quiz) => {
    if (!quiz || !quiz.title) {
      toast.error("Quiz data is missing");
      return;
    }

    let quizLink = "";

    // Ensure quiz.title is valid and generate the appropriate link
    if (quiz.title.toLowerCase() === "poll quiz") {
      quizLink = `https://quiz-app-mern-4.onrender.com/quiz/${quiz._id}`;
    } else if (quiz.title.toLowerCase() === "q&a quiz") {
      quizLink = `https://quiz-app-mern-4.onrender.com/QA-quiz/${quiz._id}`;
    } else {
      quizLink = `https://quiz-app-mern-4.onrender.com/quiz/${quiz._id}`; // Default link for other quiz types
    }

    // Copy the generated quiz link to the clipboard
    navigator.clipboard
      .writeText(quizLink)
      .then(() => toast.success(`Link copied to Clipboard for ${quiz.title}`))
      .catch(() => toast.error("Failed to copy link"));
  };

  const openModal = (quizId) => {
    setDeleteQuizId(quizId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDeleteQuizId(null);
  };

  const handleDelete = async (quizId) => {
    if (deleteQuizId) {
      try {
        const authToken = localStorage.getItem("auth-token");
        await axios.delete(
          `https://quiz-app-mern-0bj4.onrender.com/api/quizzes/quiz/${deleteQuizId}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        setQuizzes(quizzes.filter((quiz) => quiz._id !== deleteQuizId));
        toast.success("Quiz deleted successfully!");
      } catch (error) {
        console.error("Error deleting quiz:", error);
        toast.error("Failed to delete quiz.");
      }
      closeModal();
    }
  };

  const handleQuestionWiseAnalysis = (quiz) => {
    if (quiz.title.toLowerCase() === "poll quiz") {
      navigate(`/poll-quiz-analysis/${quiz._id}`);
    } else if (quiz.title.toLowerCase() === "q&a quiz") {
      navigate(`/qa-quiz-analysis/${quiz._id}`);
    } else {
      console.error("Unknown quiz type or title:", quiz.title);
    }
  };

  const handleItemClicked = (index) => {
    setActiveItem(index);
    if (index === "dashboard") {
      navigate("/dashboard");
    }
  };
  const handleEdit = async (quiz) => {
    const authToken = localStorage.getItem("auth-token");
    const quizId = quiz._id; // Ensure quizId is extracted as a string
    console.log("Auth Token:", authToken); // Check token in console
    console.log("Fetching quiz with ID:", quizId); // Check quizId in console

    try {
      const response = await axios.get(
        `https://quiz-app-mern-0bj4.onrender.com/api/quizzes/quiz/${quizId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const detailedQuiz = response.data.quiz; // Replace with actual response structure
      console.log("Detailed quiz data:", detailedQuiz);

      setEditQuiz(detailedQuiz); // Set the detailed quiz data
      setIsEditModalOpen(true); // Open the modal
    } catch (error) {
      console.error(
        "Error fetching quiz details:",
        error.response || error.message
      );
    }
  };

  const formatImpressions = (number) => {
    if (number >= 1_000_000) {
      return `${(number / 1_000_000).toFixed(1)}M`;
    } else if (number >= 1_000) {
      return `${(number / 1_000).toFixed(1)}k`;
    } else {
      return number.toString();
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

  return (
    <div className="analytics-main-container">
      <div className="analytics-sidebar">
        <div className="analytics-sidebar-header">
          <h1>QUIZZIE</h1>
        </div>
        <div className="analytics-middle-content">
          <h1
            className={`analytics-middle-content-dashboard item ${
              activeItem === "dashboard" ? "active" : ""
            }`}
            onClick={() => handleItemClicked("dashboard")}
          >
            Dashboard
          </h1>
          <h1
            className={`analytics-middle-content-analytics item ${
              activeItem === "analytics" ? "active" : ""
            }`}
            onClick={() => setActiveItem("analytics")}
          >
            Analytics
          </h1>
          <h1
            className={`analytics-middle-content-createquiz item ${
              activeItem === "createQuiz" ? "active" : ""
            }`}
            onClick={() => setIsCreateQuizOpen(true)}
          >
            Create Quiz
          </h1>
        </div>
        <div
          className="logout"
          onClick={() => {
            localStorage.removeItem("auth-token");
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            navigate("/");
          }}
        >
          <hr className="horizontal-line" />
          <h1>LOGOUT</h1>
        </div>
      </div>

      <div className="analytics-main-content">
        {showPollQuizAnalysis && selectedQuiz && (
          <PollQuizAnalysis quizId={selectedQuiz} />
        )}
        {showQAQuizAnalysis && selectedQuiz && (
          <QAQuizAnalysis quizId={selectedQuiz} />
        )}
        {!showPollQuizAnalysis && !showQAQuizAnalysis && (
          <>
            <h1 className="analytics-main-content-header">Quiz Analysis</h1>
            <div className="analytics-box-container">
              <div className="analytics-box-header">
                <div>S.No</div>
                <div>Quiz Name</div>
                <div>Created On</div>
                <div>Impression</div>
                <div className="box-header-item">Actions</div>
              </div>
              {quizzes.length > 0 ? (
                quizzes.map((quiz, index) => (
                  <div key={quiz._id} className="analytics-box-row">
                    <div className="box-row-item serial-number">
                      {index + 1}
                    </div>
                    <div className="box-row-item quiz-title">{quiz.title}</div>
                    <div className="box-row-item">
                      {formatDate(quiz.createdAt)}
                    </div>
                    <div className="box-row-item">
                      {" "}
                      {formatImpressions(quiz.impressions || 0)}
                    </div>
                    <div className="box-row-item analytics-icon">
                      <FaEdit
                        className="action-icon edit-icon"
                        title="Edit"
                        onClick={() => handleEdit(quiz)}
                      />
                      <FaTrash
                        className="action-icon delete-icon"
                        title="Delete"
                        onClick={() => openModal(quiz._id)}
                      />
                      <FaShareAlt
                        className="action-icon share-icon"
                        title="Share"
                        onClick={() => handleShare(quiz)}
                      />
                      <p
                        className="analytics-part"
                        onClick={() => handleQuestionWiseAnalysis(quiz)}
                      >
                        Question Wise Analysis
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div>No quizzes available</div>
              )}
              <ToastContainer />
            </div>
          </>
        )}
      </div>
      {isCreateQuizOpen && (
        <CreateQuiz onClose={() => setIsCreateQuizOpen(false)} />
      )}
      <DeleteModal
        isOpen={isModalOpen}
        onConfirm={handleDelete}
        onCancel={closeModal}
      />

      {isEditModalOpen && editQuiz && (
        <div className="edit-modal-overlay">
          <div className="edit-modal-content">
            {editQuiz.title.toLowerCase().includes("poll") && (
              <>
                {editQuiz.title.toLowerCase() === "poll quiz" && (
                  <PollText
                    quiz={editQuiz}
                    onClose={() => setIsEditModalOpen(false)}
                  />
                )}
                {editQuiz.title.toLowerCase() === "poll image" && (
                  <PollImage
                    quiz={editQuiz}
                    onClose={() => setIsEditModalOpen(false)}
                  />
                )}
                {editQuiz.title.toLowerCase() === "poll text image" && (
                  <PollTextImage
                    quiz={editQuiz}
                    onClose={() => setIsEditModalOpen(false)}
                  />
                )}
              </>
            )}
            {editQuiz.title.toLowerCase().includes("q&a") && (
              <>
                {editQuiz.title.toLowerCase() === "q&a text" && (
                  <QAText
                    quiz={editQuiz}
                    onClose={() => setIsEditModalOpen(false)}
                  />
                )}
                {editQuiz.title.toLowerCase() === "q&a image" && (
                  <QAImage
                    quiz={editQuiz}
                    onClose={() => setIsEditModalOpen(false)}
                  />
                )}
                {editQuiz.title.toLowerCase() === "q&a text image" && (
                  <QATextImage
                    quiz={editQuiz}
                    onClose={() => setIsEditModalOpen(false)}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;

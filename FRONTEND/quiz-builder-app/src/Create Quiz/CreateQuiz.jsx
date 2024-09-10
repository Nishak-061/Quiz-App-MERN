import React, { useState } from "react";
import "./createQuiz.css";
import QAText from "../Q&A folder/QAText";
import PollText from "../POLL FOLDER/PollText";


const CreateQuiz = ({ onClose }) => {
  const [isQASelected, setIsQASelected] = useState(false);
  const [isPollSelected, setIsPollSelected] = useState(false);
  const [showQATextPopup, setShowQATextPopup] = useState(false);
  const [showPollTypePopup, setShowPollTypePopup] = useState(false);
  const [showCreateQuizPopup, setShowCreateQuizPopup] = useState(true);

  const [quizName, setQuizName] = useState("");
  const [questions, setQuestions] = useState([]); // For handling poll questions
  const [quizPublished, setQuizPublished] = useState(false);
  const [quizLink, setQuizLink] = useState("");

  const handleQAButtonClick = () => {
    setIsQASelected(true);
    setIsPollSelected(false);
  };

  const handlePollButtonClick = () => {
    setIsQASelected(false);
    setIsPollSelected(true);
  };

  const handleContinueClick = () => {
    if (isQASelected || isPollSelected) {
      //handleCreateQuiz(); // Create quiz after selection

      setTimeout(() => {
        setShowCreateQuizPopup(false);
        if (isQASelected) {
          setShowQATextPopup(true);
        } else if (isPollSelected) {
          setShowPollTypePopup(true);
        }
      }, 500);
    }
  };

  const handleCloseModal = () => {
    setShowQATextPopup(false);
    setShowPollTypePopup(false);
    setShowCreateQuizPopup(false);
    onClose(); // Call the onClose prop passed from Dashboard
  };

  return (
    <div className="modal">
      {showCreateQuizPopup && (
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="create-quiz-input-box">
            <input
              type="text"
              className="create-quiz-input-text"
              placeholder="Quiz name"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
            />
          </div>
          <div className="create-quiz-type">
            <h2 className="create-quiz-type-text">Quiz Type</h2>
            <div className="create-quiz-QA">
              <button
                className={`create-quiz-QA-button ${
                  isQASelected ? "active" : ""
                }`}
                onClick={handleQAButtonClick}
              >
                Q & A
              </button>
            </div>
            <div className="create-quiz-poll">
              <button
                className={`create-quiz-poll-button ${
                  isPollSelected ? "active-poll" : ""
                }`}
                onClick={handlePollButtonClick}
              >
                Poll Type
              </button>
            </div>
          </div>
          <div className="create-quiz-cancel-continue">
            <div className="create-quiz-cancel">
              <button className="create-quiz-cancel-button" onClick={onClose}>
                Cancel
              </button>
            </div>
            <div className="create-quiz-continue">
              <button
                className="create-quiz-continue-button"
                onClick={handleContinueClick}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {quizPublished && (
        <div className="quiz-published-message">
          <p>Congrats! Your quiz is published.</p>
          <p>Share this link: {quizLink}</p>
        </div>
      )}

      {showQATextPopup && (
        <div className="qa-popup">
          <QAText
            quizTitle={quizName}
            questionType="Q&A"
            onClose={handleCloseModal}
          />
        </div>
      )}

      {showPollTypePopup && (
        <div className="poll-popup">
          <PollText
            quizTitle={quizName}
            setQuestions={setQuestions}
            onClose={handleCloseModal}
          />
        </div>
      )}
    </div>
  );
};

export default CreateQuiz;

import React from "react";
import "./pollcongrats.css";

const PollCongrats = ({ quizId = "", quizLink = "", onClose }) => {
  // Function to copy the quiz link to clipboard
  const handleShare = () => {
    if (quizLink) {
      navigator.clipboard
        .writeText(quizLink)
        .then(() => {
          alert("Quiz link copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy link: ", err);
        });
    }
  };
  return (
    <div className="pollcongrats-container">
      <div className="pollcongrats-close-icon">
        <h3 className="pollcongrats-close-item" onClick={onClose}>
          X
        </h3>
      </div>
      <div className="pollcongrats-header-item">
        <h2 className="pollcongrats-heading">
          Congrats your Quiz is <br /> Published!
        </h2>
      </div>
      <div className="pollcongrats-input-box">
        <input
          type="text"
          placeholder="Your link is here"
          value={quizLink}
          className="pollcongrats-input-box-item"
          readOnly
        />
      </div>
      <div className="pollcongrats-share-box">
        <button className="pollcongrats-share-button" onClick={handleShare}>
          Share
        </button>
      </div>
    </div>
  );
};

export default PollCongrats;

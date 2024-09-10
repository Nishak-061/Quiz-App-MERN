import React from "react";
import "./qacongrats.css";

const QACongrats = ({ quizId = "", quizLink = "", onClose, onShare }) => {
  return (
    <div className="qacongrats-container">
      <div className="qacongrats-close-icon">
        <h3 className="qacongrats-close-item" onClick={onClose}>
          X
        </h3>
      </div>
      <div className="qacongrats-header-item">
        <h2 className="qacongrats-heading">
          Congrats your Quiz is <br /> Published!
        </h2>
      </div>
      <div className="qacongrats-input-box">
        <input
          type="text"
          placeholder="Your link is here"
          value={quizLink}
          className="qacongrats-input-box-item"
          readOnly
        />
      </div>
      <div className="qacongrats-share-box">
        <button className="qacongrats-share-button" onClick={onShare}>
          Share
        </button>
      </div>
    </div>
  );
};

export default QACongrats;

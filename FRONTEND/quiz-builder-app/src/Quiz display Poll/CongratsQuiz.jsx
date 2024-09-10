import React from "react";
import { useLocation } from "react-router-dom";
import congratscup from "./congrats-cup.png";
import "./congratsquiz.css"; // Add your custom CSS here

const CongratsQuiz = () => {
  const location = useLocation();
  const { score, totalQuestions } = location.state || {
    score: 0,
    totalQuestions: 0,
  };

  // Format the score to have leading zeros
  const formatNumber = (num) => num.toString().padStart(2, "0");

  return (
    <div className="congrats-quiz-container">
      <div className="congrats-quiz-header-container">
        <div className="congrats-quiz-header">
          <h1 className="congrats-thankyou-quiz">Congrats Quiz is Completed</h1>
          <div className="congrats-quiz-cup-section">
            <img
              src={congratscup}
              alt="congrats cup"
              className="congrats-cup-image"
            />
            <div className="congrats-quiz-total-score">
              <h2>
                Your Score is{" "}
                <span className="score-number">{formatNumber(score)}/</span>
                <span className="score-number">
                  {formatNumber(totalQuestions)}
                </span>
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CongratsQuiz;

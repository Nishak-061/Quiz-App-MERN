import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // To get quizId from URL
import axios from "axios";

const QuizDisplay = () => {
  const { quizId } = useParams(); // Get quizId from the URL
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(
          `${REACT_APP_API_BASE_URL}/api/quizzes/quiz/${quizId}`
        );
        setQuiz(response.data.quiz);
      } catch (error) {
        setError("Failed to load the quiz. Please try again later.");
      }
    };

    fetchQuiz();
  }, [quizId]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!quiz) {
    return <p>Loading...</p>;
  }

  return (
    <div className="quiz-display">
      <h2>{quiz.title}</h2>
      {quiz.questions.map((question, index) => (
        <div key={index} className="question-block">
          <h3>{question.questionText}</h3>
          {question.options.map((option, idx) => (
            <div key={idx} className="option-block">
              <label>
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={option.text}
                />
                {option.text}
              </label>
            </div>
          ))}
        </div>
      ))}
      <button className="submit-btn">Submit</button>
    </div>
  );
};

export default QuizDisplay;

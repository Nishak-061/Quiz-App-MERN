import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Login page/Login";
import Signup from "./Sign-up page/Signup";
import Dashboard from "./Dashboard/Dashboard";
import QAText from "./Q&A folder/QAText";
import QAImage from "./Q&A folder/QAImage";
import QATextImage from "./Q&A folder/QATextImage";
import PollText from "./POLL FOLDER/PollText";
import PollImage from "./POLL FOLDER/PollImage";
import PollTextImage from "./POLL FOLDER/PollTextImage";
import PollCongrats from "./POLL FOLDER/PollCongrats";
import PollTextDisplay from "./Quiz display Poll/PollTextDisplay";
import QATextDisplay from "./Quiz display Poll/QATextDisplay";
import ParticipatePoll from "./Quiz display Poll/ParticipatePoll";
import CongratsQuiz from "./Quiz display Poll/CongratsQuiz";
import QACongrats from "./Q&A folder/QACongrats";
import Analytics from "./Analytics Folder/Analytics";
import DeleteModal from "./Analytics Folder/DeleteModal";
import PollQuizAnalysis from "./Analytics Folder/PollQuizAnalysis";
import QAQuizAnalysis from "./Analytics Folder/QAQuizAnalysis";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/quiz/:quizId" element={<PollTextDisplay />} />
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/QAText" element={<QAText />} />
        <Route path="/QAImage" element={<QAImage />} />
        <Route path="/QATextImage" element={<QATextImage />} />
        <Route path="/PollText" element={<PollText />} />
        <Route path="/PollImage" element={<PollTextImage />} />
        <Route path="/PollTextImage" element={<PollImage />} />
        <Route path="/PollCongrats" element={<PollCongrats />} />
        <Route path="/participate-poll" element={<ParticipatePoll />} />
        <Route path="/congrats-quiz" element={<CongratsQuiz />} />
        <Route path="/QACongrats" element={<QACongrats />} />
        <Route path="/QA-quiz/:quizId" element={<QATextDisplay />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/deletemodal" element={<DeleteModal />} />

        <Route
          path="/poll-quiz-analysis/:quizId"
          element={<PollQuizAnalysis />}
        />
        <Route path="/qa-quiz-analysis/:quizId" element={<QAQuizAnalysis />} />
      </Routes>
    </Router>
  );
}

export default App;

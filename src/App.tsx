import { useState } from "react";
import { loadQuestions } from "./data/loadQuestions";
import { useQuiz } from "./game/useQuiz";
import Landing from "./components/Landing";
import QuizScreen from "./components/QuizScreen";
import Results from "./components/Results";

const QUESTIONS = loadQuestions();

export default function App() {
  const [started, setStarted] = useState(false);
  const quiz = useQuiz(QUESTIONS);

  if (QUESTIONS.length === 0) {
    return (
      <div className="app error">
        <h1>לא נמצאו שאלות</h1>
        <p>השאלות אמורות להיטען מתיקיית questions.</p>
      </div>
    );
  }

  if (!started) {
    return <Landing onStart={() => setStarted(true)} />;
  }

  if (quiz.finished) {
    return <Results score={quiz.score} total={quiz.total} onRestart={quiz.restart} />;
  }

  return (
    <QuizScreen
      question={quiz.current!}
      index={quiz.index}
      total={quiz.total}
      answered={quiz.answered}
      wasCorrect={quiz.wasCorrect}
      onSubmit={quiz.submitAnswer}
      onNext={quiz.next}
    />
  );
}

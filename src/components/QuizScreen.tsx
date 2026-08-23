import type { Question } from "../types";
import QuestionCard from "./QuestionCard";
import AnswerArea from "./AnswerArea";

interface QuizScreenProps {
  question: Question;
  index: number;
  total: number;
  answered: boolean;
  wasCorrect: boolean;
  onSubmit: (isCorrect: boolean) => void;
  onNext: () => void;
}

export default function QuizScreen({
  question,
  index,
  total,
  answered,
  wasCorrect,
  onSubmit,
  onNext,
}: QuizScreenProps) {
  return (
    <div className="app quiz">
      <div className="progress">
        <span className="progress-text">
          שאלה {index + 1} מתוך {total}
        </span>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((index + (answered ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
      </div>

      <QuestionCard question={question} />

      <AnswerArea
        key={question.id}
        question={question}
        answered={answered}
        onSubmit={onSubmit}
      />

      {answered && (
        <div className={`feedback ${wasCorrect ? "correct" : "wrong"}`}>
          <span className="feedback-title">{wasCorrect ? "נכון!" : "טעות!"}</span>
          <button className="btn-primary" onClick={onNext}>
            {index + 1 >= total ? "תוצאות" : "השאלה הבאה"}
          </button>
        </div>
      )}
    </div>
  );
}

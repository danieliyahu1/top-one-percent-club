import type { Question } from "../types";

interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const showPercentage = question.percentage !== -1 && question.percentage > 0;

  return (
    <div className="question-card">
      {showPercentage && (
        <div className="percentage-badge">{question.percentage}%</div>
      )}
      {question.questionImage && (
        <img
          className="question-image"
          src={question.questionImage}
          alt="שאלה"
        />
      )}
      {question.questionText && (
        <h2 className="question-text">{question.questionText}</h2>
      )}
    </div>
  );
}

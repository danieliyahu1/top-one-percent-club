import { useState, type FormEvent } from "react";
import type { Question } from "../types";
import { isAccepted } from "../game/validate";
import Icon from "./Icon";

interface AnswerAreaProps {
  question: Question;
  answered: boolean;
  wasCorrect: boolean;
  onSubmit: (isCorrect: boolean) => void;
}

export default function AnswerArea({ question, answered, wasCorrect, onSubmit }: AnswerAreaProps) {
  const [pickedId, setPickedId] = useState<string | null>(null);

  if (question.answerMode === "choice") {
    return (
      <div className="answers">
        {(question.answers ?? []).map((answer) => {
          let className = "answer";
          if (answered && pickedId === answer.id) className += wasCorrect ? " correct" : " wrong";
          else if (answered) className += " dim";
          return (
            <button
              key={answer.id}
              className={className}
              disabled={answered}
              onClick={() => {
                setPickedId(answer.id);
                onSubmit(answer.id === question.correctAnswerId);
              }}
            >
              {answer.type === "image" ? (
                <img className="answer-image" src={answer.src} alt="תשובה" />
              ) : (
                <span className="answer-text">{answer.text}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return <TypedAnswer accepted={question.acceptedAnswers} answered={answered} onSubmit={onSubmit} />;
}

function TypedAnswer({
  accepted,
  answered,
  onSubmit,
}: {
  accepted: string[] | undefined;
  answered: boolean;
  onSubmit: (isCorrect: boolean) => void;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (answered || value.trim() === "") return;
    onSubmit(isAccepted(value, accepted));
  }

  return (
    <form className="typed-answer" onSubmit={handleSubmit}>
      <input
        className="typed-input"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="הקלד את תשובתך..."
        disabled={answered}
        autoFocus
      />
      <button
        className="btn-primary"
        type="submit"
        disabled={answered || value.trim() === ""}
        aria-label="שלח"
      >
        <Icon name="submit" label="שלח" />
      </button>
    </form>
  );
}

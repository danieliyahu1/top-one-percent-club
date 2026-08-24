import { useState, type FormEvent } from "react";
import type { Question } from "../types";
import type { RoomPhase, RoomSnapshot } from "../game/multiplayer";
import Icon from "./Icon";

interface AnswerAreaProps {
  question: Question;
  phase: RoomPhase;
  reveal?: RoomSnapshot["reveal"];
  myCorrect: boolean;
  onSubmit: (answerId: string | null, text?: string) => void;
}

export default function AnswerArea({ question, phase, reveal, myCorrect, onSubmit }: AnswerAreaProps) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isReveal = phase === "reveal";

  function handleChoice(answerId: string) {
    if (submitted) return;
    setPickedId(answerId);
    setSubmitted(true);
    onSubmit(answerId);
  }

  if (question.answerMode === "choice") {
    return (
      <div className="answers">
        {(question.answers ?? []).map((answer) => {
          let className = "answer";
          if (isReveal) {
            if (myCorrect && answer.id === reveal?.correctAnswerId)
              className += " correct reveal-correct";
            else if (pickedId === answer.id) className += " wrong";
            else className += " dim";
          } else if (submitted && pickedId === answer.id) {
            className += " picked";
          } else if (submitted) {
            className += " dim";
          }
          return (
            <button
              key={answer.id}
              className={className}
              disabled={submitted}
              onClick={() => handleChoice(answer.id)}
            >
              {answer.type === "image" ? (
                <img className="answer-image" src={answer.src} alt="תשובה" />
              ) : (
                <span className="answer-text">{answer.text}</span>
              )}
              {isReveal && pickedId === answer.id && (
                <span className={`answer-badge ${myCorrect ? "correct" : "wrong"}`}>
                  <Icon name={myCorrect ? "check" : "cross"} label={myCorrect ? "נכון" : "טעות"} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <TypedAnswer
      submitted={submitted}
      isReveal={isReveal}
      myCorrect={myCorrect}
      onSubmit={(text) => {
        setSubmitted(true);
        onSubmit(null, text);
      }}
    />
  );
}

function TypedAnswer({
  submitted,
  isReveal,
  myCorrect,
  onSubmit,
}: {
  submitted: boolean;
  isReveal: boolean;
  myCorrect: boolean;
  onSubmit: (text: string) => void;
}) {
  const [localValue, setLocalValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = localValue.trim();
    if (submitted || text === "") return;
    onSubmit(text);
  }

  const verdictClass = !isReveal ? "" : myCorrect ? " correct" : " wrong";

  return (
    <form className="typed-answer" onSubmit={handleSubmit}>
      <input
        className={`typed-input${verdictClass}`}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="הקלד את תשובתך..."
        disabled={submitted || isReveal}
        autoFocus={!isReveal}
      />
      <button
        className="btn-primary"
        type="submit"
        disabled={submitted || isReveal || localValue.trim() === ""}
        aria-label="שלח"
      >
        <Icon name="submit" label="שלח" />
      </button>
    </form>
  );
}
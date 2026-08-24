import { useState, type FormEvent } from "react";
import type { Question } from "../types";
import type { RoomPhase, RoomSnapshot } from "../game/multiplayer";

interface AnswerAreaProps {
  question: Question;
  phase: RoomPhase;
  reveal?: RoomSnapshot["reveal"];
  onSubmit: (answerId: string | null, text?: string) => void;
}

export default function AnswerArea({ question, phase, reveal, onSubmit }: AnswerAreaProps) {
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
            if (answer.id === reveal?.correctAnswerId) className += " correct";
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
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <TypedAnswer
      submitted={submitted}
      onSubmit={(text) => {
        setSubmitted(true);
        onSubmit(null, text);
      }}
    />
  );
}

function TypedAnswer({
  submitted,
  onSubmit,
}: {
  submitted: boolean;
  onSubmit: (text: string) => void;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitted || value.trim() === "") return;
    onSubmit(value.trim());
  }

  return (
    <form className="typed-answer" onSubmit={handleSubmit}>
      <input
        className="typed-input"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="הקלד את תשובתך..."
        disabled={submitted}
        autoFocus
      />
      <button className="btn-primary" type="submit" disabled={submitted || value.trim() === ""}>
        שלח
      </button>
    </form>
  );
}

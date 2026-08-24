import { useState, type FormEvent } from "react";
import type { Question } from "../types";
import type { RoomPhase, RoomSnapshot } from "../game/multiplayer";
import { isAccepted } from "../game/validate";

interface AnswerAreaProps {
  question: Question;
  phase: RoomPhase;
  reveal?: RoomSnapshot["reveal"];
  onSubmit: (answerId: string | null, text?: string) => void;
}

export default function AnswerArea({ question, phase, reveal, onSubmit }: AnswerAreaProps) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedText, setSubmittedText] = useState("");

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
            if (answer.id === reveal?.correctAnswerId) className += " correct reveal-correct";
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
      isReveal={isReveal}
      accepted={reveal?.acceptedAnswers}
      value={submittedText}
      onSubmit={(text) => {
        setSubmittedText(text);
        setSubmitted(true);
        onSubmit(null, text);
      }}
    />
  );
}

function TypedAnswer({
  submitted,
  isReveal,
  accepted,
  value,
  onSubmit,
}: {
  submitted: boolean;
  isReveal: boolean;
  accepted: string[] | undefined;
  value: string;
  onSubmit: (text: string) => void;
}) {
  const [localValue, setLocalValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = (value || localValue).trim();
    if (submitted || text === "") return;
    onSubmit(text);
  }

  if (isReveal) {
    const correct = value !== "" && isAccepted(value, accepted);
    return (
      <div className="typed-reveal">
        <div className={`typed-answer-result ${correct ? "correct" : "wrong"}`}>
          <span className="typed-result-text">{value || "לא ענית"}</span>
        </div>
        <div className="typed-answer-result correct">
          <span className="typed-result-text">{accepted?.join(" / ") ?? ""}</span>
        </div>
      </div>
    );
  }

  return (
    <form className="typed-answer" onSubmit={handleSubmit}>
      <input
        className="typed-input"
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="הקלד את תשובתך..."
        disabled={submitted}
        autoFocus
      />
      <button className="btn-primary" type="submit" disabled={submitted || localValue.trim() === ""}>
        שלח
      </button>
    </form>
  );
}
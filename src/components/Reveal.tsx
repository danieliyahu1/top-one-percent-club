import { useEffect, useState } from "react";
import type { RoomSnapshot } from "../game/multiplayer";
import QuestionCard from "./QuestionCard";
import MultiAnswerArea from "./MultiAnswerArea";

interface RevealProps {
  room: RoomSnapshot;
  myId: string;
  isHost: boolean;
  clockOffset: number;
  onNext: () => void;
}

const REVEAL_MS = 10000;

export default function Reveal({ room, myId, isHost, clockOffset, onNext }: RevealProps) {
  const question = room.question!;
  const reveal = room.reveal!;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const totalMs = Math.max(0, room.revealDeadline - (now + clockOffset));
  const remaining = Math.ceil(totalMs / 1000);
  const me = room.players.find((p) => p.id === myId);
  const answered = me?.answered ?? false;
  const myCorrect = answered && !!me?.correct;
  const nonVoters = room.players.filter((p) => !p.answered);
  const isLast = room.index + 1 >= room.total;

  let iconClass = "wrong";
  let icon = "✗";
  if (myCorrect) {
    iconClass = "correct";
    icon = "✓";
  } else if (!answered) {
    iconClass = "timeout";
    icon = "⌛";
  }

  return (
    <div className="app reveal">
      <div className="progress">
        <span className="progress-text">
          שאלה {room.index + 1} מתוך {room.total}
        </span>
      </div>

      <div className={`reveal-icon ${iconClass}`}>
        {icon}
      </div>

      <QuestionCard question={question} />

      <MultiAnswerArea
        key={`reveal-${question.id}`}
        question={question}
        phase="reveal"
        reveal={reveal}
        myCorrect={myCorrect}
        onSubmit={() => {}}
      />

      {nonVoters.length > 0 && (
        <p className="non-voters">לא ענו: {nonVoters.map((p) => p.name).join(", ")}</p>
      )}

      <div className="reveal-timer">
        <div className="timer-bar">
          <div
            className="timer-fill"
            style={{ width: `${(totalMs / REVEAL_MS) * 100}%` }}
          />
        </div>
        <span className="timer-text">
          {isLast ? "לתוצאות בעוד" : "השאלה הבאה בעוד"} {remaining}
        </span>
      </div>

      {isHost && (
        <button className="btn-primary" onClick={onNext}>
          {isLast ? "לתוצאות" : "השאלה הבאה"}
        </button>
      )}
    </div>
  );
}
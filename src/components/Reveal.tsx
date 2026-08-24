import { useEffect, useState } from "react";
import type { RoomSnapshot } from "../game/multiplayer";
import QuestionCard from "./QuestionCard";
import MultiAnswerArea from "./MultiAnswerArea";
import Icon from "./Icon";

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
        <span className="progress-text" aria-label={`שאלה ${room.index + 1} מתוך ${room.total}`}>
          {room.index + 1} / {room.total}
        </span>
      </div>

      <div className={`reveal-icon ${iconClass}`} role="img" aria-label="תוצאה">
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
        <p className="non-voters">
          <Icon name="wait" label="לא ענו" />
          {nonVoters.map((p) => p.name).join(", ")}
        </p>
      )}

      <div className="reveal-timer">
        <div className="timer-bar">
          <div
            className="timer-fill"
            style={{ width: `${(totalMs / REVEAL_MS) * 100}%` }}
          />
        </div>
        <span className="timer-text" aria-label="השניה הבאה בעוד">
          <Icon name="wait" label="ממתין" /> {remaining}
        </span>
      </div>

      {isHost && (
        <button className="btn-primary" onClick={onNext} aria-label={isLast ? "לתוצאות" : "השאלה הבאה"}>
          <Icon name={isLast ? "results" : "next"} label={isLast ? "לתוצאות" : "השאלה הבאה"} />
        </button>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import type { RoomSnapshot } from "../game/multiplayer";
import QuestionCard from "./QuestionCard";
import MultiAnswerArea from "./MultiAnswerArea";

interface RevealProps {
  room: RoomSnapshot;
  myId: string;
  isHost: boolean;
  onNext: () => void;
}

export default function Reveal({ room, myId, isHost, onNext }: RevealProps) {
  const question = room.question!;
  const reveal = room.reveal!;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.ceil(Math.max(0, room.revealDeadline - now) / 1000);
  const me = room.players.find((p) => p.id === myId);
  const myCorrect = me?.answered && me?.correct;
  const nonVoters = room.players.filter((p) => !p.answered);

  return (
    <div className="app reveal">
      <div className="progress">
        <span className="progress-text">
          שאלה {room.index + 1} מתוך {room.total}
        </span>
      </div>

      <div className={`reveal-title ${myCorrect ? "correct" : "wrong"}`}>
        {myCorrect ? "נכון!" : "טעות!"}
      </div>

      <QuestionCard question={question} />

      <MultiAnswerArea
        key={`reveal-${question.id}`}
        question={question}
        phase="reveal"
        reveal={reveal}
        onSubmit={() => {}}
      />

      {nonVoters.length > 0 && (
        <p className="non-voters">
          לא ענו: {nonVoters.map((p) => p.name).join(", ")}
        </p>
      )}

      {isHost ? (
        <button className="btn-primary" onClick={onNext}>
          {room.index + 1 >= room.total ? "לתוצאות" : "השאלה הבאה"}
        </button>
      ) : (
        <p className="share-hint">ממתין למנחה... ({remaining})</p>
      )}
    </div>
  );
}

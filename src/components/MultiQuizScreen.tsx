import { useEffect, useState } from "react";
import type { RoomSnapshot } from "../game/multiplayer";
import QuestionCard from "./QuestionCard";
import MultiAnswerArea from "./MultiAnswerArea";
import Icon from "./Icon";

interface QuizScreenProps {
  room: RoomSnapshot;
  myAnswered: boolean;
  clockOffset: number;
  onSubmit: (answerId: string | null, text?: string) => void;
}

export default function QuizScreen({ room, myAnswered, clockOffset, onSubmit }: QuizScreenProps) {
  const question = room.question!;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const totalMs = Math.max(0, room.deadline - (now + clockOffset));
  const secondsLeft = Math.ceil(totalMs / 1000);
  const answeredCount = room.players.filter((p) => p.answered).length;

  return (
    <div className="app quiz">
      <div className="progress">
        <span className="progress-text" aria-label={`שאלה ${room.index + 1} מתוך ${room.total}`}>
          {room.index + 1} / {room.total}
        </span>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(room.index / room.total) * 100}%` }}
          />
        </div>
      </div>

      <div className="question-timer">
        <div className="timer-bar">
          <div
            className="timer-fill"
            style={{ width: `${(totalMs / 60000) * 100}%` }}
          />
        </div>
        <span className="timer-text" aria-label={`${secondsLeft} שניות`}>
          <Icon name="clock" label="זמן" /> {secondsLeft}
        </span>
      </div>

      <QuestionCard question={question} />

      <MultiAnswerArea
        key={question.id}
        question={question}
        phase={room.phase}
        myCorrect={false}
        onSubmit={onSubmit}
      />

      {myAnswered && (
        <div className="waiting" aria-label={`ממתין לחברים ${answeredCount}/${room.players.length}`}>
          <span className="waiting-spinner" />
          <span>
            <Icon name="friends" label="חברים" /> {answeredCount}/{room.players.length}
          </span>
        </div>
      )}
    </div>
  );
}
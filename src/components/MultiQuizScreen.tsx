import { useEffect, useState } from "react";
import type { RoomSnapshot } from "../game/multiplayer";
import QuestionCard from "./QuestionCard";
import MultiAnswerArea from "./MultiAnswerArea";
import Standings from "./Standings";
import Icon from "./Icon";

const QUESTION_MS = 60000;
const ANSWER_ACT_MS = 4500;
const TABLE_MS = 5000;

type Act = "answer" | "table";

interface QuizScreenProps {
  room: RoomSnapshot;
  myId: string;
  isHost: boolean;
  clockOffset: number;
  prevRanks: Record<string, number>;
  prevScores: Record<string, number>;
  onSubmit: (answerId: string | null, text?: string) => void;
  onNext: () => void;
}

export default function QuizScreen({
  room,
  myId,
  isHost,
  clockOffset,
  prevRanks,
  prevScores,
  onSubmit,
  onNext,
}: QuizScreenProps) {
  const question = room.question!;
  const [now, setNow] = useState(Date.now());
  const [act, setAct] = useState<Act>("answer");

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (room.phase !== "reveal") return;
    setAct("answer");
    const id = setTimeout(() => setAct("table"), ANSWER_ACT_MS);
    return () => clearTimeout(id);
  }, [room.phase, room.index]);

  const isReveal = room.phase === "reveal";
  const showTable = isReveal && act === "table";
  const deadline = showTable ? room.revealDeadline : room.deadline;
  const remainingMs = Math.max(0, deadline - (now + clockOffset));
  const secondsLeft = Math.ceil(remainingMs / 1000);

  const me = room.players.find((p) => p.id === myId);
  const answeredCount = room.players.filter((p) => p.answered).length;
  const myCorrect = !!me?.answered && !!me?.correct;
  const isLast = room.index + 1 >= room.total;

  return (
    <div className="app quiz">
      <div className="progress">
        <span className="progress-text" aria-label={`שאלה ${room.index + 1} מתוך ${room.total}`}>
          {room.index + 1} / {room.total}
        </span>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((room.index + (isReveal ? 1 : 0)) / room.total) * 100}%` }}
          />
        </div>
      </div>

      {!isReveal && (
        <div className="question-timer">
          <div className="timer-bar">
            <div
              className="timer-fill"
              style={{ width: `${(remainingMs / QUESTION_MS) * 100}%` }}
            />
          </div>
          <span className="timer-text" aria-label={`${secondsLeft} שניות`}>
            <Icon name="clock" label="זמן" /> {secondsLeft}
          </span>
        </div>
      )}

      {!showTable && <QuestionCard question={question} />}

      {!showTable && (
        <MultiAnswerArea
          key={question.id}
          question={question}
          phase={room.phase}
          reveal={room.reveal}
          myCorrect={myCorrect}
          onSubmit={onSubmit}
        />
      )}

      {showTable && (
        <Standings
          key={`standings-${room.index}`}
          players={room.players}
          myId={myId}
          prevRanks={prevRanks}
          prevScores={prevScores}
          correctIds={room.reveal?.correctPlayers ?? []}
        />
      )}

      {showTable && (
        <div className="question-timer">
          <div className="timer-bar">
            <div
              className="timer-fill"
              style={{ width: `${Math.min(100, (remainingMs / TABLE_MS) * 100)}%` }}
            />
          </div>
          <span className="timer-text" aria-label={`${secondsLeft} שניות`}>
            <Icon name="wait" label="ממתין" /> {secondsLeft}
          </span>
        </div>
      )}

      {!isReveal && me?.answered && (
        <div className="waiting" aria-label={`ממתין לחברים ${answeredCount}/${room.players.length}`}>
          <span className="waiting-spinner" />
          <span>
            <Icon name="friends" label="חברים" /> {answeredCount}/{room.players.length}
          </span>
        </div>
      )}

      {isReveal && isHost && (
        <button
          className="btn-primary"
          onClick={onNext}
          aria-label={isLast ? "לתוצאות" : "השאלה הבאה"}
        >
          <Icon name={isLast ? "results" : "next"} label={isLast ? "לתוצאות" : "השאלה הבאה"} />
        </button>
      )}
    </div>
  );
}

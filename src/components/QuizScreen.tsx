import { useEffect, useRef, useState } from "react";
import type { Question } from "../types";
import QuestionCard from "./QuestionCard";
import AnswerArea from "./AnswerArea";
import Icon from "./Icon";

const ANSWER_DELAY_SECONDS = 10;

interface QuizScreenProps {
  question: Question;
  index: number;
  total: number;
  answered: boolean;
  wasCorrect: boolean;
  onSubmit: (isCorrect: boolean) => void;
  onNext: () => void;
}

export default function QuizScreen({
  question,
  index,
  total,
  answered,
  wasCorrect,
  onSubmit,
  onNext,
}: QuizScreenProps) {
  const [secondsLeft, setSecondsLeft] = useState(ANSWER_DELAY_SECONDS);
  const advancingRef = useRef(false);

  useEffect(() => {
    advancingRef.current = false;
    setSecondsLeft(ANSWER_DELAY_SECONDS);
  }, [question.id]);

  useEffect(() => {
    if (!answered) return;
    if (secondsLeft <= 0) {
      if (advancingRef.current) return;
      advancingRef.current = true;
      onNext();
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [answered, secondsLeft, onNext]);

  return (
    <div className="app quiz">
      <div className="progress">
        <span className="progress-text" aria-label={`שאלה ${index + 1} מתוך ${total}`}>
          {index + 1} / {total}
        </span>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((index + (answered ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
      </div>

      <QuestionCard question={question} />

      <AnswerArea
        key={question.id}
        question={question}
        answered={answered}
        wasCorrect={wasCorrect}
        onSubmit={onSubmit}
      />

      {answered && (
        <div className={`feedback ${wasCorrect ? "correct" : "wrong"}`}>
          <span className="feedback-title" role="img" aria-label={wasCorrect ? "נכון" : "טעות"}>
            <Icon name={wasCorrect ? "check" : "cross"} label={wasCorrect ? "נכון" : "טעות"} />
          </span>
          <div className="timer">
            <div className="timer-bar">
              <div
                className="timer-fill"
                style={{
                  width: `${(secondsLeft / ANSWER_DELAY_SECONDS) * 100}%`,
                }}
              />
            </div>
            <span className="timer-text" aria-label="השניה הבאה בעוד">
              <Icon name="clock" label="זמן" /> {secondsLeft}
            </span>
          </div>
          <button className="btn-primary" onClick={onNext} aria-label="השאלה הבאה">
            <Icon
              name={index + 1 >= total ? "results" : "next"}
              label={index + 1 >= total ? "לתוצאות" : "השאלה הבאה"}
            />
          </button>
        </div>
      )}
    </div>
  );
}
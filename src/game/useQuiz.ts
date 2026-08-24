import { useCallback, useMemo, useState } from "react";
import type { Question } from "../types";

export const QUIZ_SIZE = 10;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuiz(questions: Question[]): Question[] {
  return shuffle(questions).slice(0, QUIZ_SIZE);
}

export function useQuiz(questions: Question[]) {
  const [quiz, setQuiz] = useState<Question[]>(() => pickQuiz(questions));
  const [order, setOrder] = useState<number[]>(() =>
    shuffle(quiz.map((_, i) => i)),
  );
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [finished, setFinished] = useState(false);

  const total = quiz.length;

  const current = useMemo(
    () => (index < total ? quiz[order[index]] : undefined),
    [quiz, order, index, total],
  );

  const submitAnswer = useCallback(
    (isCorrect: boolean) => {
      if (answered) return;
      setWasCorrect(isCorrect);
      setAnswered(true);
      if (isCorrect) setScore((s) => s + 1);
    },
    [answered],
  );

  const next = useCallback(() => {
    if (index + 1 >= total) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setAnswered(false);
    }
  }, [index, total]);

  const restart = useCallback(() => {
    const newQuiz = pickQuiz(questions);
    setQuiz(newQuiz);
    setOrder(shuffle(newQuiz.map((_, i) => i)));
    setIndex(0);
    setScore(0);
    setAnswered(false);
    setFinished(false);
  }, [questions]);

  return {
    current,
    index,
    total,
    score,
    answered,
    wasCorrect,
    finished,
    submitAnswer,
    next,
    restart,
  };
}

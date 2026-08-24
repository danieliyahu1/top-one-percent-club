import { useCallback, useState } from "react";
import { useQuiz } from "./game/useQuiz";
import { loadQuestions } from "./data/loadQuestions";
import { useMultiplayer } from "./game/useMultiplayer";
import Landing from "./components/Landing";
import QuizScreen from "./components/QuizScreen";
import Results from "./components/Results";
import Lobby from "./components/Lobby";
import MultiQuizScreen from "./components/MultiQuizScreen";
import Leaderboard from "./components/Leaderboard";

const QUESTIONS = loadQuestions();

type Screen = "home" | "solo";

function readCodeFromHash(): string | undefined {
  const m = window.location.hash.match(/^#\/room\/([A-Za-z0-9]+)/);
  return m ? m[1].toUpperCase() : undefined;
}

function setHashCode(code: string) {
  window.location.hash = `/room/${code}`;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [defaultCode] = useState(readCodeFromHash);
  const mp = useMultiplayer();
  const quiz = useQuiz(QUESTIONS);
  const room = mp.room;

  const goHome = useCallback(() => {
    setScreen("home");
  }, []);

  const handlePlaySolo = useCallback(() => {
    if (mp.room) return;
    quiz.restart();
    setScreen("solo");
  }, [mp.room, quiz]);

  const handleCreate = useCallback(async (name: string) => {
    const res = await mp.createRoom(name);
    if (res.ok && res.code) {
      setHashCode(res.code);
    }
  }, [mp]);

  const handleJoin = useCallback(async (code: string, name: string) => {
    const res = await mp.joinRoom(code, name);
    if (res.ok && res.code) {
      setHashCode(res.code);
    }
  }, [mp]);

  const handleLeave = useCallback(() => {
    mp.leave();
    setScreen("home");
  }, [mp]);

  const handleAnswer = useCallback(
    (answerId: string | null, text?: string) => {
      if (answerId != null) mp.submitChoice(answerId);
      else if (text != null) mp.submitTyped(text);
    },
    [mp],
  );

  if (room) {
    const myId = mp.myId;

    if (room.phase === "lobby") {
      return <Lobby room={room} isHost={mp.isHost} onStart={mp.start} onLeave={handleLeave} />;
    }

    if (room.phase === "question" || room.phase === "reveal") {
      return (
        <MultiQuizScreen
          room={room}
          myId={myId}
          isHost={mp.isHost}
          clockOffset={mp.clockOffset}
          prevRanks={mp.prevRanks}
          prevScores={mp.prevScores}
          onSubmit={handleAnswer}
          onNext={mp.next}
        />
      );
    }

    return (
      <Leaderboard
        room={room}
        myId={myId}
        isHost={mp.isHost}
        onRestart={mp.restart}
        onHome={handleLeave}
      />
    );
  }

  if (screen === "solo") {
    if (quiz.finished) {
      return (
        <Results
          score={quiz.score}
          total={quiz.total}
          onRestart={quiz.restart}
          onHome={goHome}
        />
      );
    }
    return (
      <QuizScreen
        question={quiz.current!}
        index={quiz.index}
        total={quiz.total}
        answered={quiz.answered}
        wasCorrect={quiz.wasCorrect}
        onSubmit={quiz.submitAnswer}
        onNext={quiz.next}
      />
    );
  }

  return (
    <Landing
      defaultCode={defaultCode}
      busy={mp.busy}
      error={mp.error}
      onPlaySolo={handlePlaySolo}
      onCreate={handleCreate}
      onJoin={handleJoin}
    />
  );
}
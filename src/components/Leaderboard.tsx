import type { RoomSnapshot } from "../game/multiplayer";

interface ResultsProps {
  room: RoomSnapshot;
  myId: string;
  isHost: boolean;
  onRestart: () => void;
  onHome: () => void;
}

export default function Results({ room, myId, isHost, onRestart, onHome }: ResultsProps) {
  const ranked = [...room.players].sort((a, b) => b.score - a.score);
  const me = room.players.find((p) => p.id === myId);
  const myRank = ranked.findIndex((p) => p.id === myId) + 1;

  return (
    <div className="app results">
      <div className="result-percent">{myRank}</div>
      <h1 className="title">סיימתם!</h1>
      {me && (
        <p className="score">
          {me.name}: <strong>{me.score}</strong> מתוך <strong>{room.total}</strong>
        </p>
      )}

      <div className="leaderboard">
        {ranked.map((p, i) => (
          <div
            key={p.id}
            className={`leader-row ${p.id === myId ? "me" : ""}`}
          >
            <span className="leader-rank">{i + 1}</span>
            <span className="leader-name">{p.name}</span>
            <span className="leader-score">{p.score}</span>
          </div>
        ))}
      </div>

      {isHost && (
        <button className="btn-primary" onClick={onRestart}>
          שחק שוב
        </button>
      )}

      <button className="link-btn" onClick={onHome}>
        לדף הבית
      </button>
    </div>
  );
}

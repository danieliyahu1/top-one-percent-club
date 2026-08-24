import { useState } from "react";
import type { RoomSnapshot } from "../game/multiplayer";

interface ResultsProps {
  room: RoomSnapshot;
  myId: string;
  isHost: boolean;
  onRestart: () => void;
  onHome: () => void;
}

export default function Results({ room, myId, isHost, onRestart, onHome }: ResultsProps) {
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const ranked = [...room.players].sort((a, b) => b.score - a.score);
  const me = room.players.find((p) => p.id === myId);
  const myRank = ranked.findIndex((p) => p.id === myId) + 1;

  function handleHomeClick() {
    if (isHost) {
      setConfirmingLeave(true);
    } else {
      onHome();
    }
  }

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

      {confirmingLeave ? (
        <div className="confirm-box">
          <p className="confirm-text">לצאת יסגור את החדר לכולם. להמשיך?</p>
          <div className="confirm-actions">
            <button className="btn-primary btn-danger" onClick={onHome}>
              כן, צא
            </button>
            <button className="link-btn" onClick={() => setConfirmingLeave(false)}>
              ביטול
            </button>
          </div>
        </div>
      ) : (
        <button className="link-btn" onClick={handleHomeClick}>
          לדף הבית
        </button>
      )}
    </div>
  );
}

import { useState } from "react";
import type { RoomSnapshot } from "../game/multiplayer";
import Icon from "./Icon";

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
        <p className="score" aria-label={`${me.name}: ${me.score} מתוך ${room.total}`}>
          {me.name}: <strong>{me.score}</strong> / <strong>{room.total}</strong>
        </p>
      )}

      <div className="leaderboard">
        {ranked.map((p, i) => (
          <div
            key={p.id}
            className={`leader-row ${p.id === myId ? "me" : ""}`}
          >
            <span className="leader-rank">{i === 0 ? <Icon name="trophy" label="מקום ראשון" /> : i + 1}</span>
            <span className="leader-name">{p.name}</span>
            <span className="leader-score">{p.score}</span>
          </div>
        ))}
      </div>

      {isHost && (
        <button className="btn-primary" onClick={onRestart} aria-label="שחק שוב">
          <Icon name="restart" label="שחק שוב" />
        </button>
      )}

      {confirmingLeave ? (
        <div className="confirm-box">
          <p className="confirm-text">לצאת מהחדר יסיים את המשחק לכולם</p>
          <div className="confirm-actions">
            <button className="btn-primary btn-danger" onClick={onHome} aria-label="לצאת">
              <span>לצאת</span>
            </button>
            <button className="link-btn" onClick={() => setConfirmingLeave(false)} aria-label="להישאר">
              <span>להישאר</span>
            </button>
          </div>
        </div>
      ) : (
        <button className="link-btn" onClick={handleHomeClick} aria-label="לדף הבית">
          <Icon name="home" label="לדף הבית" />
        </button>
      )}
    </div>
  );
}
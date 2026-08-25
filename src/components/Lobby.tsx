import { useState } from "react";
import type { RoomSnapshot } from "../game/multiplayer";
import Icon from "./Icon";

interface LobbyProps {
  room: RoomSnapshot;
  isHost: boolean;
  onStart: () => void;
  onLeave: () => void;
}

export default function Lobby({ room, isHost, onStart, onLeave }: LobbyProps) {
  const [confirmingLeave, setConfirmingLeave] = useState(false);

  function handleLeaveClick() {
    if (isHost) {
      setConfirmingLeave(true);
    } else {
      onLeave();
    }
  }

  return (
    <div className="app lobby">
      <h1 className="title">האחוזון העליון</h1>

      <div className="share-card">
        <span className="share-label">
          <Icon name="share" label="שתף את קוד החדר" />
        </span>
        <span className="room-code">{room.code}</span>
        <p className="share-hint">שלח את הקוד או הקישור לחברים</p>
      </div>

      <div className="player-list">
        {room.players.map((p) => (
          <div key={p.id} className="player-row">
            <span className="player-dot" />
            <span className="player-name">{p.name}</span>
          </div>
        ))}
      </div>

      {isHost ? (
        <button
          className="btn-primary"
          onClick={onStart}
          disabled={room.players.length === 0}
          aria-label="התחל משחק"
        >
          <Icon name="gamepad" label="התחל משחק" />
        </button>
      ) : (
        <p className="share-hint">
          <Icon name="wait" label="ממתין שהמנחה יתחיל" />
        </p>
      )}

      {confirmingLeave ? (
        <div className="confirm-box">
          <p className="confirm-text">לצאת מהחדר יסיים את המשחק לכולם</p>
          <div className="confirm-actions">
            <button className="btn-primary btn-danger" onClick={onLeave} aria-label="לצאת">
              <span>לצאת</span>
            </button>
            <button className="link-btn" onClick={() => setConfirmingLeave(false)} aria-label="להישאר">
              <span>להישאר</span>
            </button>
          </div>
        </div>
      ) : (
        <button className="link-btn" onClick={handleLeaveClick} aria-label="עזוב">
          <Icon name="leave" label="עזוב" />
        </button>
      )}
    </div>
  );
}
import type { RoomSnapshot } from "../game/multiplayer";

interface LobbyProps {
  room: RoomSnapshot;
  isHost: boolean;
  onStart: () => void;
  onLeave: () => void;
}

export default function Lobby({ room, isHost, onStart, onLeave }: LobbyProps) {
  return (
    <div className="app lobby">
      <h1 className="title">האחוזון העליון</h1>

      <div className="share-card">
        <span className="share-label">שתף את קוד החדר</span>
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
        <button className="btn-primary" onClick={onStart} disabled={room.players.length === 0}>
          התחל משחק
        </button>
      ) : (
        <p className="share-hint">ממתין שהמנחה יתחיל...</p>
      )}

      <button className="link-btn" onClick={onLeave}>
        עזוב
      </button>
    </div>
  );
}

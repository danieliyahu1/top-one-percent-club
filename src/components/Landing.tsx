import { useState, type FormEvent } from "react";
import Icon from "./Icon";

interface LandingProps {
  defaultCode?: string;
  busy: boolean;
  error: string | null;
  onPlaySolo: () => void;
  onCreate: (name: string) => void;
  onJoin: (code: string, name: string) => void;
}

export default function Landing({
  defaultCode,
  busy,
  error,
  onPlaySolo,
  onCreate,
  onJoin,
}: LandingProps) {
  const [friendsOpen, setFriendsOpen] = useState(!!defaultCode);
  const [mode, setMode] = useState<"create" | "join">(defaultCode ? "join" : "create");
  const [name, setName] = useState("");
  const [code, setCode] = useState(defaultCode ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (mode === "create") onCreate(name.trim());
    else if (code.trim()) onJoin(code.trim(), name.trim());
  }

  return (
    <div className="app landing">
      <div className="logo">%</div>
      <h1 className="title">האחוזון העליון</h1>
      <p className="subtitle">רק 1% יענו נכון על כולן</p>

      <button className="btn-primary btn-solo" onClick={onPlaySolo} aria-label="התחל משחק">
        <Icon name="play" label="התחל משחק" />
      </button>

      <div className="divider">
        <span>או</span>
      </div>

      <button
        className="btn-friends"
        onClick={() => setFriendsOpen((o) => !o)}
        aria-expanded={friendsOpen}
      >
        <Icon name={friendsOpen ? "play" : "friends"} label="שחק עם חברים" />
      </button>

      {friendsOpen && (
        <div className="friends-panel">
          <div className="join-toggle">
            <button
              className={`toggle-btn ${mode === "create" ? "active" : ""}`}
              onClick={() => setMode("create")}
            >
              <Icon name="create" label="צור חדר" />
            </button>
            <button
              className={`toggle-btn ${mode === "join" ? "active" : ""}`}
              onClick={() => setMode("join")}
            >
              <Icon name="join" label="הצטרף" />
            </button>
          </div>

          <form className="landing-form" onSubmit={handleSubmit}>
            <div className="input-with-icon">
              <Icon name="person" label="השם שלך" />
              <input
                className="typed-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="השם שלך"
              />
            </div>
            {mode === "join" && (
              <div className="input-with-icon">
                <Icon name="code" label="קוד החדר" />
                <input
                  className="typed-input"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="קוד החדר"
                />
              </div>
            )}
            <button
              className="btn-primary"
              type="submit"
              disabled={busy || !name.trim() || (mode === "join" && !code.trim())}
            >
              <Icon
                name={busy ? "wait" : "submit"}
                label={busy ? "טוען..." : mode === "create" ? "צור חדר" : "הצטרף"}
              />
            </button>
          </form>

          {error && <p className="form-error">{error}</p>}
        </div>
      )}
    </div>
  );
}
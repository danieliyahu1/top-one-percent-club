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
  const [name, setName] = useState("");
  const [code, setCode] = useState(defaultCode ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (code.trim()) onJoin(code.trim(), name.trim());
    else onCreate(name.trim());
  }

  const willJoin = code.trim().length > 0;

  return (
    <div className="app landing">
      <div className="logo">%</div>
      <h1 className="title">האחוזון העליון</h1>
      <p className="subtitle">רק 1% יענו נכון על כולן</p>

      <button
        className="btn-primary btn-hero"
        onClick={() => setFriendsOpen((o) => !o)}
        aria-expanded={friendsOpen}
      >
        <Icon name="friends" label="שחק עם חברים" />
        <span>שחק עם חברים</span>
      </button>

      {friendsOpen && (
        <div className="friends-panel">
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
            <div className="input-with-icon">
              <Icon name="code" label="קוד החדר" />
              <input
                className="typed-input"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="קוד חדר (אופציונלי)"
              />
            </div>
            <button
              className="btn-primary"
              type="submit"
              disabled={busy || !name.trim()}
            >
              <Icon
                name={busy ? "wait" : willJoin ? "join" : "create"}
                label={busy ? "טוען..." : willJoin ? "הצטרף" : "צור חדר"}
              />
              <span>{busy ? "טוען..." : willJoin ? "הצטרף" : "צור חדר"}</span>
            </button>
          </form>

          {error && <p className="form-error">{error}</p>}
        </div>
      )}

      <button className="link-btn" onClick={onPlaySolo} aria-label="משחק יחיד">
        <Icon name="gamepad" label="משחק יחיד" />
        <span>משחק יחיד</span>
      </button>
    </div>
  );
}
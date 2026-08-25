import { useEffect, useRef, useState, type FormEvent } from "react";
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
  const [joinMode, setJoinMode] = useState(!!defaultCode);
  const [name, setName] = useState("");
  const [code, setCode] = useState(defaultCode ?? "");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (joinMode && code.trim()) onJoin(code.trim(), name.trim());
    else if (!joinMode) onCreate(name.trim());
  }

  function switchToJoin() {
    setJoinMode(true);
    setTimeout(() => codeInputRef.current?.focus(), 0);
  }

  function switchToCreate() {
    setJoinMode(false);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  }

  return (
    <div className="app landing">
      <div className="logo">%</div>
      <h1 className="title">האחוזון העליון</h1>
      <p className="subtitle">רק 1% יענו נכון על כולן</p>

      <form className="landing-form" onSubmit={handleSubmit}>
        <div className="input-with-icon">
          <Icon name="person" label="השם שלך" />
          <input
            ref={nameInputRef}
            className="typed-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="השם שלך"
          />
        </div>

        {joinMode && (
          <div className="input-with-icon">
            <Icon name="code" label="קוד של חדר קיים" />
            <input
              ref={codeInputRef}
              className="typed-input"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="קוד של חדר קיים"
            />
          </div>
        )}

        <button
          className="btn-primary"
          type="submit"
          disabled={busy || !name.trim() || (joinMode && !code.trim())}
        >
          <Icon
            name={busy ? "clock" : joinMode ? "join" : "create"}
            label={busy ? "טוען..." : joinMode ? "הצטרף" : "צור חדר"}
          />
          <span>{busy ? "טוען..." : joinMode ? "הצטרף" : "צור חדר"}</span>
        </button>
      </form>

      {error && <p className="form-error">{error}</p>}

      <button
        className="link-btn"
        onClick={joinMode ? switchToCreate : switchToJoin}
      >
        <Icon
          name={joinMode ? "create" : "join"}
          label={joinMode ? "אין קוד? צרו חדר חדש" : "יש קוד? הצטרפו לחדר קיים"}
        />
        <span>{joinMode ? "אין קוד? צרו חדר חדש" : "יש קוד? הצטרפו לחדר קיים"}</span>
      </button>

      <button className="link-btn" onClick={onPlaySolo} aria-label="משחק יחיד">
        <Icon name="gamepad" label="משחק יחיד" />
        <span>משחק יחיד</span>
      </button>
    </div>
  );
}
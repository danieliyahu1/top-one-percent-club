import Icon from "./Icon";

interface ResultsProps {
  score: number;
  total: number;
  onRestart: () => void;
  onHome?: () => void;
}

export default function Results({ score, total, onRestart, onHome }: ResultsProps) {
  const pct = Math.round((score / total) * 100);
  let message = "המשך להתאמן";
  if (pct === 100) message = "אתה באחוזון העליון";
  else if (pct >= 80) message = "כמעט שם";
  else if (pct >= 50) message = "יפה מאוד";
  else if (pct >= 30) message = "לא רע";

  return (
    <div className="app results">
      <div className="result-percent">{pct}%</div>
      <h1 className="title">{message}</h1>
      <p className="score" aria-label={`ענית נכון על ${score} מתוך ${total}`}>
        <Icon name="check" label="נכון" /> {score} / {total}
      </p>
      <button className="btn-primary" onClick={onRestart} aria-label="שחק שוב">
        <Icon name="restart" label="שחק שוב" />
      </button>

      {onHome && (
        <button className="link-btn" onClick={onHome} aria-label="לדף הבית">
          <Icon name="home" label="לדף הבית" />
        </button>
      )}
    </div>
  );
}
interface ResultsProps {
  score: number;
  total: number;
  onRestart: () => void;
}

export default function Results({ score, total, onRestart }: ResultsProps) {
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
      <p className="score">
        ענית נכון על <strong>{score}</strong> מתוך <strong>{total}</strong>
      </p>
      <button className="btn-primary" onClick={onRestart}>
        שחק שוב
      </button>
    </div>
  );
}

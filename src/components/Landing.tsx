interface LandingProps {
  count: number;
  onStart: () => void;
}

export default function Landing({ count, onStart }: LandingProps) {
  return (
    <div className="app landing">
      <div className="logo">%</div>
      <h1 className="title">האחוזון העליון</h1>
      <p className="subtitle">משחק החידות של 1%</p>
      <p className="meta">{count} שאלות · ענה נכון כדי לצבור נקודות</p>
      <button className="btn-primary" onClick={onStart}>
        התחל משחק
      </button>
    </div>
  );
}

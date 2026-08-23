interface LandingProps {
  onStart: () => void;
}

export default function Landing({ onStart }: LandingProps) {
  return (
    <div className="app landing">
      <div className="logo">%</div>
      <h1 className="title">האחוזון העליון</h1>
      <p className="subtitle">רק 1% יענו נכון על כולן</p>
      <button className="btn-primary" onClick={onStart}>
        התחל משחק
      </button>
    </div>
  );
}

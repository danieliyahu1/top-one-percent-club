import { useCallback, useEffect, useRef, useState } from "react";
import type { RoomPlayer } from "../game/multiplayer";
import Icon from "./Icon";

interface StandingsProps {
  players: RoomPlayer[];
  myId: string;
  prevRanks: Record<string, number>;
  prevScores: Record<string, number>;
  correctIds: string[];
}

const PREV_HOLD_MS = 800;
const TWEEN_MS = 900;
const ROW_GAP = 8;

export default function Standings({
  players,
  myId,
  prevRanks,
  prevScores,
  correctIds,
}: StandingsProps) {
  const [showingNew, setShowingNew] = useState(false);
  const [displayScores, setDisplayScores] = useState<Record<string, number>>({
    ...prevScores,
  });
  const [rowStep, setRowStep] = useState(60);
  const frameRef = useRef(0);

  const newRanked = [...players].sort((a, b) => b.score - a.score);
  const prevRanked = [...players].sort(
    (a, b) => (prevRanks[a.id] ?? 999) - (prevRanks[b.id] ?? 999),
  );
  const shown = showingNew ? newRanked : prevRanked;

  useEffect(() => {
    const id = setTimeout(() => setShowingNew(true), PREV_HOLD_MS);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!showingNew) return;
    const from = { ...prevScores };
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / TWEEN_MS);
      const eased = 1 - Math.pow(1 - k, 3);
      const next: Record<string, number> = {};
      players.forEach((p) => {
        const was = from[p.id] ?? p.score;
        next[p.id] = Math.round(was + (p.score - was) * eased);
      });
      setDisplayScores(next);
      if (k < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showingNew]);

  const measureRef = useCallback((el: HTMLDivElement | null) => {
    if (el) setRowStep(el.offsetHeight + ROW_GAP);
  }, []);

  return (
    <div className="standings">
      <div className="standings-header">
        <Icon name="trophy" label="טבלת התוצאות" />
        <span className="standings-hint">
          {correctIds.length}/{players.length} צדקו
        </span>
      </div>

      <div className="standings-rows" style={{ height: shown.length * rowStep }}>
        {shown.map((p, i) => {
          const rank = i + 1;
          const prev = prevRanks[p.id];
          const moved = showingNew && prev != null ? prev - rank : 0;
          const gained = showingNew && correctIds.includes(p.id);
          let rowClass = "leader-row";
          if (p.id === myId) rowClass += " me";
          if (moved > 0) rowClass += " move-up";
          if (moved < 0) rowClass += " move-down";
          if (gained) rowClass += " got-point";
          return (
            <div
              key={p.id}
              ref={i === 0 ? measureRef : undefined}
              className={rowClass}
              style={{ transform: `translateY(${i * rowStep}px)` }}
            >
              <span className="leader-rank">
                {rank === 1 ? <Icon name="trophy" label="מקום ראשון" /> : rank}
              </span>
              {moved > 0 ? (
                <span className="move-badge" aria-label="עלה בדירוג">
                  <Icon name="up" label="עלה" />
                </span>
              ) : moved < 0 ? (
                <span className="move-badge" aria-label="ירד בדירוג">
                  <Icon name="down" label="ירד" />
                </span>
              ) : (
                <span className="move-same">=</span>
              )}
              <span className="leader-name">
                {p.name}
                {p.id === myId && <Icon name="person" label="אתה" />}
              </span>
              <span className="leader-score">
                {displayScores[p.id] ?? p.score}
                {gained && <span className="point-pop">+1</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

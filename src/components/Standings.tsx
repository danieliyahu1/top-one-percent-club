import { useEffect, useRef, useState } from "react";
import type { RoomPlayer } from "../game/multiplayer";
import Icon from "./Icon";

interface StandingsProps {
  players: RoomPlayer[];
  myId: string;
  prevRanks: Record<string, number>;
  prevScores: Record<string, number>;
  correctIds: string[];
}

const TWEEN_MS = 900;

export default function Standings({
  players,
  myId,
  prevRanks,
  prevScores,
  correctIds,
}: StandingsProps) {
  const [displayScores, setDisplayScores] = useState<Record<string, number>>({
    ...prevScores,
  });
  const frameRef = useRef(0);

  const ranked = [...players].sort((a, b) => b.score - a.score);

  useEffect(() => {
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
  }, [players, prevScores]);

  return (
    <div className="standings">
      <div className="standings-header">
        <span className="standings-title">המובילים</span>
        <span className="standings-hint">
          {correctIds.length}/{players.length} צדקו
        </span>
      </div>

      <div className="leaderboard">
        {ranked.map((p, i) => {
          const rank = i + 1;
          const prev = prevRanks[p.id];
          const moved = prev != null ? prev - rank : 0;
          const gained = correctIds.includes(p.id);
          let rowClass = "leader-row";
          if (p.id === myId) rowClass += " me";
          if (moved > 0) rowClass += " move-up";
          if (moved < 0) rowClass += " move-down";
          if (gained) rowClass += " got-point";
          return (
            <div key={p.id} className={rowClass}>
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
              <span className="leader-name">{p.name}</span>
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

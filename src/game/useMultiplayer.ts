import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "./socket";
import type { RoomSnapshot } from "./multiplayer";

function rankPlayers(players: RoomSnapshot["players"]): Record<string, number> {
  const ranked = [...players].sort((a, b) => b.score - a.score);
  const ranks: Record<string, number> = {};
  ranked.forEach((p, i) => {
    ranks[p.id] = i + 1;
  });
  return ranks;
}

function scoresOf(players: RoomSnapshot["players"]): Record<string, number> {
  const scores: Record<string, number> = {};
  players.forEach((p) => {
    scores[p.id] = p.score;
  });
  return scores;
}

interface JoinResult {
  ok: boolean;
  error?: string;
  code?: string;
  snapshot?: RoomSnapshot;
}

export function useMultiplayer() {
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [myId, setMyId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [clockOffset, setClockOffset] = useState(0);
  const capturedIndexRef = useRef<number | null>(null);
  const [prevRanks, setPrevRanks] = useState<Record<string, number>>({});
  const [prevScores, setPrevScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const refreshId = () => setMyId(socket.id ?? "");
    socket.on("connect", refreshId);
    socket.on("state", (snapshot: RoomSnapshot) => {
      refreshId();
      setRoom(snapshot);
      setClockOffset(snapshot.serverNow - Date.now());
      if (snapshot.phase === "lobby") {
        capturedIndexRef.current = null;
        setPrevRanks({});
        setPrevScores({});
        return;
      }
      if (
        snapshot.phase === "question" &&
        capturedIndexRef.current !== snapshot.index
      ) {
        capturedIndexRef.current = snapshot.index;
        setPrevRanks(rankPlayers(snapshot.players));
        setPrevScores(scoresOf(snapshot.players));
      }
    });
    socket.on("room:closed", () => {
      setRoom(null);
      setError("המנחה סגר את החדר");
    });
    socket.on("connect_error", () => setError("חיבור נכשל"));
    if (socket.connected) refreshId();
    return () => {
      socket.off("connect", refreshId);
      socket.off("state");
      socket.off("room:closed");
      socket.off("connect_error");
    };
  }, []);

  const requestJoin = useCallback((opts: { code?: string; name: string }) => {
    return new Promise<JoinResult>((resolve) => {
      if (opts.code) {
        socket.emit("join", { code: opts.code, name: opts.name }, resolve);
      } else {
        socket.emit("create", opts.name, resolve);
      }
    });
  }, []);

  const createRoom = useCallback(
    async (name: string): Promise<JoinResult> => {
      setBusy(true);
      setError(null);
      const res = await requestJoin({ name });
      setBusy(false);
      if (!res.ok) {
        setError(res.error ?? "שגיאה ביצירת החדר");
        return res;
      }
      if (res.snapshot) setRoom(res.snapshot);
      return res;
    },
    [requestJoin],
  );

  const joinRoom = useCallback(
    async (code: string, name: string): Promise<JoinResult> => {
      setBusy(true);
      setError(null);
      const res = await requestJoin({ code, name });
      setBusy(false);
      if (!res.ok) {
        setError(res.error === "name_taken" ? "השם תפוס בחדר" : "החדר לא נמצא");
        return res;
      }
      if (res.snapshot) setRoom(res.snapshot);
      return res;
    },
    [requestJoin],
  );

  const start = useCallback(() => {
    if (room) socket.emit("start", room.code);
  }, [room]);

  const submitChoice = useCallback(
    (answerId: string) => {
      if (room) socket.emit("answer", { code: room.code, answerId });
    },
    [room],
  );

  const submitTyped = useCallback(
    (text: string) => {
      if (room) socket.emit("answer", { code: room.code, text });
    },
    [room],
  );

  const next = useCallback(() => {
    if (room) socket.emit("next", room.code);
  }, [room]);

  const restart = useCallback(() => {
    if (room) socket.emit("restart", room.code);
  }, [room]);

  const leave = useCallback(() => {
    socket.emit("leave");
    setRoom(null);
    setMyId("");
    setError(null);
  }, []);

  const isHost = room ? room.hostId === myId : false;

  return {
    room,
    myId,
    error,
    busy,
    clockOffset,
    isHost,
    prevRanks,
    prevScores,
    createRoom,
    joinRoom,
    start,
    submitChoice,
    submitTyped,
    next,
    restart,
    leave,
  };
}

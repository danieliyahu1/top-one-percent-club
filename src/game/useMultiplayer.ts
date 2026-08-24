import { useCallback, useEffect, useState } from "react";
import { socket } from "./socket";
import type { RoomSnapshot } from "./multiplayer";

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

  useEffect(() => {
    const refreshId = () => setMyId(socket.id ?? "");
    socket.on("connect", refreshId);
    socket.on("state", (snapshot: RoomSnapshot) => {
      refreshId();
      setRoom(snapshot);
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
    isHost,
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

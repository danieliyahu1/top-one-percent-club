import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { join } from "node:path";
import express from "express";
import { Server, type Socket } from "socket.io";
import { RoomManager } from "./game.js";

const PORT = Number(process.env.PORT) || 3001;
const DIST_DIR = join(process.cwd(), "dist");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});
const rooms = new RoomManager();

app.use("/questions", express.static(join(process.cwd(), "questions")));

if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/questions")) {
      next();
      return;
    }
    res.sendFile(join(DIST_DIR, "index.html"));
  });
}

function emitRoom(code: string) {
  const room = rooms.get(code);
  if (!room) return;
  io.to(code).emit("state", rooms.snapshot(room));
}

rooms.onChange = (code) => emitRoom(code);

function leaveRoom(socket: Socket) {
  const code = socket.data.room as string | undefined;
  if (!code) return;
  socket.data.room = null;
  const room = rooms.get(code);
  if (!room) return;
  socket.leave(code);
  if (room.hostId === socket.id) {
    rooms.remove(code);
    io.to(code).emit("room:closed");
    return;
  }
  const removed = rooms.removePlayer(code, socket.id);
  if (!removed) emitRoom(code);
}

io.on("connection", (socket) => {
  socket.on("create", (name: string, ack) => {
    const room = rooms.create(socket.id);
    rooms.addPlayer(room.code, socket.id, String(name).trim() || "Guest");
    socket.join(room.code);
    socket.data.room = room.code;
    ack?.({ ok: true, code: room.code, snapshot: rooms.snapshot(room) });
    emitRoom(room.code);
  });

  socket.on("join", (payload: { code: string; name: string }, ack) => {
    const code = String(payload.code).trim().toUpperCase();
    const room = rooms.get(code);
    if (!room) {
      ack?.({ ok: false, error: "room_not_found" });
      return;
    }
    const player = rooms.addPlayer(code, socket.id, String(payload.name).trim() || "Guest");
    if (!player) {
      ack?.({ ok: false, error: "name_taken" });
      return;
    }
    socket.join(code);
    socket.data.room = code;
    ack?.({ ok: true, code, snapshot: rooms.snapshot(room) });
    emitRoom(code);
  });

  socket.on("start", (code: string) => {
    const room = rooms.get(code);
    if (!room || room.hostId !== socket.id) return;
    rooms.start(code);
    emitRoom(code);
  });

  socket.on("answer", (payload: { code: string; answerId?: string; text?: string }) => {
    const result = rooms.submitAnswer(
      payload.code,
      socket.id,
      { answerId: payload.answerId, text: payload.text },
    );
    if (!result) return;
    emitRoom(payload.code);
  });

  socket.on("next", (code: string) => {
    const room = rooms.get(code);
    if (!room || room.hostId !== socket.id) return;
    rooms.next(code);
    emitRoom(code);
  });

  socket.on("restart", (code: string) => {
    const room = rooms.get(code);
    if (!room || room.hostId !== socket.id) return;
    rooms.restart(code);
    emitRoom(code);
  });

  socket.on("leave", () => {
    leaveRoom(socket);
  });

  socket.on("disconnect", () => {
    leaveRoom(socket);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

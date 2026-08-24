import { loadQuestions } from "./questions.js";
import type { Question } from "../src/types.js";
import { isAccepted } from "./validate.js";

export const QUIZ_SIZE = 10;
export const QUESTION_SECONDS = 60;

export interface Player {
  id: string;
  name: string;
  score: number;
  answered: boolean;
  correct: boolean;
}

export type Phase = "lobby" | "question" | "reveal" | "results";

export interface Room {
  code: string;
  hostId: string;
  players: Player[];
  questions: Question[];
  order: number[];
  index: number;
  phase: Phase;
  deadline: number;
  timer: NodeJS.Timeout | null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuiz(all: Question[]): { questions: Question[]; order: number[] } {
  const questions = shuffle(all).slice(0, QUIZ_SIZE);
  const order = shuffle(questions.map((_, i) => i));
  return { questions, order };
}

function makeCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function publicQuestion(room: Room): Question | undefined {
  const q = room.questions[room.order[room.index]];
  if (!q) return undefined;
  const { correctAnswerId, acceptedAnswers, ...safe } = q;
  return safe;
}

export class RoomManager {
  private rooms = new Map<string, Room>();
  private allQuestions: Question[];
  onChange: ((code: string) => void) | null = null;

  constructor() {
    this.allQuestions = loadQuestions();
  }

  get(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  list(): Room[] {
    return [...this.rooms.values()];
  }

  remove(code: string): void {
    this.rooms.delete(code.toUpperCase());
  }

  create(hostId: string): Room {
    let code = makeCode();
    while (this.rooms.has(code)) code = makeCode();
    const room: Room = {
      code,
      hostId,
      players: [],
      questions: [],
      order: [],
      index: 0,
      phase: "lobby",
      deadline: 0,
      timer: null,
    };
    this.rooms.set(code, room);
    return room;
  }

  addPlayer(code: string, id: string, name: string): Player | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    if (room.phase !== "lobby") return null;
    if (room.players.some((p) => p.name === name)) return null;
    const player: Player = { id, name, score: 0, answered: false, correct: false };
    room.players.push(player);
    return player;
  }

  removePlayer(code: string, id: string): boolean {
    const room = this.rooms.get(code);
    if (!room) return false;
    const before = room.players.length;
    room.players = room.players.filter((p) => p.id !== id);
    if (room.players.length !== before && room.players.length === 0) {
      this.rooms.delete(code);
      return true;
    }
    return false;
  }

  start(code: string): Room | null {
    const room = this.rooms.get(code);
    if (!room || room.phase !== "lobby" || room.players.length === 0) return null;
    const { questions, order } = pickQuiz(this.allQuestions);
    room.questions = questions;
    room.order = order;
    room.index = 0;
    room.players.forEach((p) => {
      p.score = 0;
      p.answered = false;
      p.correct = false;
    });
    this.beginQuestion(room);
    return room;
  }

  private beginQuestion(room: Room): void {
    room.phase = "question";
    room.players.forEach((p) => {
      p.answered = false;
      p.correct = false;
    });
    room.deadline = Date.now() + QUESTION_SECONDS * 1000;
    this.scheduleQuestionEnd(room);
  }

  private scheduleQuestionEnd(room: Room): void {
    if (room.timer) clearTimeout(room.timer);
    const remaining = room.deadline - Date.now();
    room.timer = setTimeout(() => {
      this.endQuestion(room);
      this.onChange?.(room.code);
    }, Math.max(0, remaining));
  }

  submitAnswer(
    code: string,
    id: string,
    payload: { answerId?: string; text?: string },
  ): { room: Room; answered: boolean; correct: boolean } | null {
    const room = this.rooms.get(code);
    if (!room || room.phase !== "question") return null;
    const player = room.players.find((p) => p.id === id);
    if (!player || player.answered) return null;
    const q = room.questions[room.order[room.index]];
    let correct = false;
    if (q.answerMode === "choice") {
      correct = payload.answerId === q.correctAnswerId;
    } else {
      correct = isAccepted(payload.text ?? "", q.acceptedAnswers);
    }
    player.answered = true;
    player.correct = correct;
    if (correct) player.score += 1;
    const allAnswered = room.players.every((p) => p.answered);
    if (allAnswered) {
      if (room.timer) clearTimeout(room.timer);
      this.endQuestion(room);
    }
    return { room, answered: true, correct };
  }

  private endQuestion(room: Room): void {
    if (room.timer) {
      clearTimeout(room.timer);
      room.timer = null;
    }
    room.phase = "reveal";
  }

  advance(room: Room): void {
    if (room.timer) clearTimeout(room.timer);
    const last = room.index + 1 >= room.questions.length;
    if (last) {
      room.phase = "results";
      room.deadline = 0;
      return;
    }
    room.index += 1;
    this.beginQuestion(room);
  }

  next(code: string): Room | null {
    const room = this.rooms.get(code);
    if (!room || room.phase !== "reveal") return null;
    this.advance(room);
    return room;
  }

  restart(code: string): Room | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    const { questions, order } = pickQuiz(this.allQuestions);
    room.questions = questions;
    room.order = order;
    room.index = 0;
    room.phase = "lobby";
    room.players.forEach((p) => {
      p.score = 0;
      p.answered = false;
      p.correct = false;
    });
    return room;
  }

  snapshot(room: Room, viewerId?: string) {
    const correctPlayers = room.players
      .filter((p) => p.answered && p.correct)
      .map((p) => p.id);
    let reveal:
      | { correctAnswerId?: string; acceptedAnswers?: string[]; correctPlayers: string[] }
      | undefined;
    if (room.phase === "reveal") {
      const q = room.questions[room.order[room.index]];
      const viewer = room.players.find((p) => p.id === viewerId);
      const viewerCorrect = !!viewer?.answered && !!viewer?.correct;
      reveal = {
        ...(viewerCorrect ? { correctAnswerId: q.correctAnswerId } : {}),
        ...(viewerCorrect ? { acceptedAnswers: q.acceptedAnswers } : {}),
        correctPlayers,
      };
    }
    return {
      code: room.code,
      hostId: room.hostId,
      players: room.players.map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
        answered: p.answered,
        correct: p.correct,
      })),
      index: room.index,
      total: room.questions.length,
      phase: room.phase,
      deadline: room.deadline,
      serverNow: Date.now(),
      question: publicQuestion(room),
      reveal,
    };
  }
}

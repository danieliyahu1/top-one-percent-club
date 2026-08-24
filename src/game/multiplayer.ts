import type { Question } from "../types";

export type RoomPhase = "lobby" | "question" | "reveal" | "results";

export interface RoomPlayer {
  id: string;
  name: string;
  score: number;
  answered: boolean;
  correct: boolean;
}

export interface RoomSnapshot {
  code: string;
  hostId: string;
  players: RoomPlayer[];
  index: number;
  total: number;
  phase: RoomPhase;
  deadline: number;
  revealDeadline: number;
  serverNow: number;
  question?: Question;
  reveal?: {
    correctAnswerId?: string;
    acceptedAnswers?: string[];
    correctPlayers: string[];
  };
}

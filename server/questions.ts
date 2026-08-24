import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Answer, Question } from "../src/types.js";

type RawAnswer = {
  id?: string;
  type?: string;
  text?: string;
  src?: string;
};

type RawQuestion = {
  id?: string;
  percentage?: number;
  questionText?: string;
  questionImage?: string;
  answerMode?: "choice" | "typed";
  answers?: RawAnswer[];
  correctAnswerId?: string;
  acceptedAnswers?: unknown[];
};

const QUESTIONS_DIR = join(process.cwd(), "questions");

function dirname(path: string): string {
  const idx = path.lastIndexOf("/");
  return idx === -1 ? "" : path.slice(0, idx);
}

function publicPath(folder: string, filename: string | undefined): string | undefined {
  if (!filename) return undefined;
  return `/questions/${folder}/${filename.replace(/\\/g, "/")}`;
}

function normalizeAnswers(answers: RawAnswer[] | undefined, folder: string): Answer[] {
  if (!answers) return [];
  return answers
    .filter((a) => a && a.type)
    .map((a) => {
      if (a.type === "image") {
        return { id: a.id ?? "", type: "image", src: publicPath(folder, a.src) ?? "" } satisfies Answer;
      }
      return { id: a.id ?? "", type: "text", text: a.text ?? "" } satisfies Answer;
    });
}

function coerceQuestion(raw: RawQuestion, folder: string): Question {
  return {
    id: raw.id ?? "",
    percentage: typeof raw.percentage === "number" ? raw.percentage : -1,
    questionText: raw.questionText ?? "",
    questionImage: publicPath(folder, raw.questionImage),
    answerMode: raw.answerMode === "typed" ? "typed" : "choice",
    answers: raw.answerMode === "typed" ? undefined : normalizeAnswers(raw.answers, folder),
    correctAnswerId: raw.correctAnswerId ?? undefined,
    acceptedAnswers:
      raw.answerMode === "typed"
        ? (raw.acceptedAnswers ?? []).map((a) => String(a))
        : undefined,
  };
}

function listModelFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.endsWith("-ready")) listModelFiles(full, out);
    } else if (entry.name.endsWith("-model.json")) {
      out.push(full);
    }
  }
  return out;
}

export function loadQuestions(): Question[] {
  const questions: Question[] = [];
  for (const file of listModelFiles(QUESTIONS_DIR)) {
    const raw: RawQuestion = JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
    if (!raw) continue;
    const rel = file.slice(QUESTIONS_DIR.length + 1).replace(/\\/g, "/");
    questions.push(coerceQuestion(raw, dirname(rel)));
  }
  return questions;
}

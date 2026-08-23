import type { Answer, Question } from "../types";

type RawQuestion = {
  id?: string;
  percentage?: number;
  questionText?: string;
  questionImage?: string;
  answerMode?: "choice" | "typed";
  answers?: Array<{ id?: string; type?: string; text?: string; src?: string }>;
  correctAnswerId?: string;
  acceptedAnswers?: unknown[];
};

const jsonModules = import.meta.glob("/questions/**/*-model.json", {
  eager: true,
  import: "default",
}) as Record<string, RawQuestion>;

const imageModules = import.meta.glob("/questions/**/*.{jpg,jpeg,png}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

function dirname(path: string): string {
  const idx = path.lastIndexOf("/");
  return idx === -1 ? "" : path.slice(0, idx);
}

function resolveImage(folder: string, filename: string | undefined): string | undefined {
  if (!filename) return undefined;
  const normalized = filename.replace(/\\/g, "/");
  const url = imageModules[`${folder}/${normalized}`];
  return url ?? undefined;
}

function normalizeAnswers(answers: RawQuestion["answers"], folder: string): Answer[] {
  if (!answers) return [];
  return answers
    .filter((a) => a && a.type)
    .map((a) => {
      if (a.type === "image") {
        return { id: a.id ?? "", type: "image", src: resolveImage(folder, a.src) ?? "" } satisfies Answer;
      }
      return { id: a.id ?? "", type: "text", text: a.text ?? "" } satisfies Answer;
    });
}

function coerceQuestion(raw: RawQuestion, folder: string): Question {
  return {
    id: raw.id ?? "",
    percentage: typeof raw.percentage === "number" ? raw.percentage : -1,
    questionText: raw.questionText ?? "",
    questionImage: resolveImage(folder, raw.questionImage),
    answerMode: raw.answerMode === "typed" ? "typed" : "choice",
    answers: raw.answerMode === "typed" ? undefined : normalizeAnswers(raw.answers, folder),
    correctAnswerId: raw.correctAnswerId ?? undefined,
    acceptedAnswers:
      raw.answerMode === "typed"
        ? (raw.acceptedAnswers ?? []).map((a) => String(a))
        : undefined,
  };
}

export function loadQuestions(): Question[] {
  const questions: Question[] = [];
  for (const [path, raw] of Object.entries(jsonModules)) {
    if (!raw) continue;
    questions.push(coerceQuestion(raw, dirname(path)));
  }
  return questions;
}

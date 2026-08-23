export type Answer =
  | { id: string; type: "text"; text: string }
  | { id: string; type: "image"; src: string };

export type AnswerMode = "choice" | "typed";

export interface Question {
  id: string;
  /** Public stat shown on screen (1–90); use -1 when unknown. */
  percentage: number;
  questionText?: string;
  questionImage?: string;
  answerMode: AnswerMode;
  answers?: Answer[];
  correctAnswerId?: string;
  acceptedAnswers?: string[];
}

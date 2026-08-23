# Data Model — האחוזון העליון (The 1% Club)

## `Question`

```ts
export type Answer =
  | { id: string; type: "text";  text: string }
  | { id: string; type: "image"; src: string };

export type AnswerMode = "choice" | "typed";

export interface Question {
  id: string;
  percentage: number;
  questionText?: string;
  questionImage?: string;
  answerMode: AnswerMode;
  answers?: Answer[];
  correctAnswerId?: string;
  acceptedAnswers?: string[];
}
```

## Fields

| Field             | Type             | Required | Description                                                                   |
| ----------------- | ---------------- | -------- | ----------------------------------------------------------------------------- |
| `id`              | `string`         | yes      | Unique question identifier, e.g. `"q10-1"`                                    |
| `percentage`      | `number`         | yes      | Public stat shown on screen — % of the population who answered correctly (1–90). Use `-1` when unknown. |
| `questionText`    | `string`         | no       | Hebrew question text                                                          |
| `questionImage`   | `string`         | no       | Question image src (for visual riddles)                                       |
| `answerMode`      | `"choice"` / `"typed"` | yes | How the player responds                                                        |
| `answers`         | `Answer[]`       | choice   | The options (text or image), 4 for choice questions                           |
| `correctAnswerId` | `string`         | choice   | `id` of the correct option (stable across reordering)                          |
| `acceptedAnswers` | `string[]`       | typed    | Accepted free-text answers (spelling/number variants)                         |

## Notes

- `questionText` and `questionImage` are both optional — a question may be text, an image, or both.
- `choice` questions must set `answers` + `correctAnswerId`. The correct option is referenced by its `id`, not its position, so answers can be reordered without breaking the data.
- `typed` questions must set `acceptedAnswers` (multiple accepted variants allowed, e.g. masculine/feminine, with/without ניקוד, different spellings). Matching is lenient: case/diacritics/punctuation-insensitive.
- `Answer` can be either a text option or an image option (cropped from the show frame); each carries its own `id`.

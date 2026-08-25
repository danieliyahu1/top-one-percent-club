import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { validateQuestionModelFiles } from "./validate-questions.mjs";

function withQuestionDirectory(callback) {
  const directory = mkdtempSync(join(tmpdir(), "question-validation-"));
  try {
    callback(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test("accepts valid question model JSON files", () => {
  withQuestionDirectory((directory) => {
    writeFileSync(join(directory, "valid-model.json"), '{"id":"q-1"}');
    writeFileSync(join(directory, "ignored.json"), '{"id":"not-a-model"}');

    assert.equal(validateQuestionModelFiles(directory), 1);
  });
});

test("reports the malformed question model file", () => {
  withQuestionDirectory((directory) => {
    writeFileSync(join(directory, "invalid-model.json"), '{"answers":["answer",]}');

    assert.throws(
      () => validateQuestionModelFiles(directory),
      /invalid-model\.json: .*Unexpected token/,
    );
  });
});

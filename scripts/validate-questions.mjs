import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";

const MODEL_FILE_SUFFIX = "-model.json";

export function findQuestionModelFiles(directory) {
  const files = [];
  const entries = readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...findQuestionModelFiles(path));
    } else if (entry.name.endsWith(MODEL_FILE_SUFFIX)) {
      files.push(path);
    }
  }

  return files;
}

export function validateQuestionModelFiles(directory) {
  const files = findQuestionModelFiles(directory);
  const errors = [];

  for (const file of files) {
    try {
      JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${relative(directory, file)}: ${message}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid question JSON:\n${errors.join("\n")}`);
  }

  return files.length;
}

function main() {
  const directory = process.argv[2] ?? join(process.cwd(), "questions");
  const count = validateQuestionModelFiles(directory);
  console.log(`Validated ${count} question model files.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

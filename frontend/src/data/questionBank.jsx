import { codingQuestions }   from "./codingQuestions.jsx";
import { aptitudeQuestions } from "./aptitudeQuestions.jsx";
import { sqlQuestions }      from "./sqlQuestions.jsx";

// Re-export all question arrays and SQL helpers
export { codingQuestions };
export { aptitudeQuestions };
export { sqlQuestions };
export { SQL_SCHEMA, SQL_SEED_DATA } from "./sqlQuestions.jsx";

// Legacy compat aliases
export const mcqQuestions = aptitudeQuestions;
export const questionBank = codingQuestions;

// ── Shuffle utility ────────────────────────────────────────────────────────
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Test mode: random subset ───────────────────────────────────────────────
// Called with NO arguments — questions are imported above
export function getTestQuestions() {
  return {
    coding:   shuffleArray(codingQuestions).slice(0, 5),
    aptitude: shuffleArray(aptitudeQuestions).slice(0, 10),
    sql:      shuffleArray(sqlQuestions).slice(0, 5),
  };
}

// ── Practice mode: all questions shuffled ─────────────────────────────────
// Called with NO arguments — questions are imported above
export function getPracticeQuestions() {
  return {
    coding:   shuffleArray(codingQuestions),
    aptitude: shuffleArray(aptitudeQuestions),
    sql:      shuffleArray(sqlQuestions),
  };
}
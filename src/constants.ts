import { valid, playable } from "./fixtures/words.json";
import type { Evaluation, State, Statistic } from "./types";

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const WORD_LIST = [...valid, ...playable];
const offsetFromDate = new Date(2022, 0, 1).getTime();
const msOffset = Date.now() - offsetFromDate;
const dayOffset = msOffset / 1000 / 60 / 60 / 24;
const ANSWER_INDEX = Math.floor(dayOffset);
const ANSWER: string = playable[ANSWER_INDEX];

declare global {
    interface Window {
        answer: string;
        state: State;
    }
}
window.answer = ANSWER;

const RATING: Record<Evaluation, number> = {
    absent: 0,
    present: 1,
    correct: 2,
};

const CONGRATULATIONS = ["Genius", "Magnificent", "Impressive", "Splendid", "Great", "Phew"];

const initialState: State = {
    attempts: Array.from({ length: MAX_ATTEMPTS }).map((_) => ""),
    attempt_index: 0,
    evaluation: [],
    status: "in-progress",
    timestamp: new Date(),
};

const initialStats: Statistic = {
    averageGuesses: 0,
    currentStreak: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    guesses: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0 },
    maxStreak: 0,
    winPercentage: 0,
};

const STUDENTS = {
    Ellen: "/students/index.html",
    Mark: "/students/index.html",
    Kevin: "/students/index.html",
    NBA: "/students/nba_wordle/index.html",
};

export { WORD_LENGTH, MAX_ATTEMPTS, ANSWER, CONGRATULATIONS, RATING, WORD_LIST, playable, initialState, initialStats, STUDENTS };

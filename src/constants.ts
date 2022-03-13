import { valid, playable } from "./fixtures/words.json";
import type { Evaluation, State, Statistic } from "./types";

const LENGTH = 5;
const MAX_ATTEMPTS = 6;
const TILES_NODES: HTMLDivElement[] = [];
const TILES_ROWS: HTMLDivElement[] = [];
const KEYBOARD_NODES: HTMLButtonElement[] = [];
const RATING: Record<Evaluation, number> = {
    absent: 0,
    present: 1,
    correct: 2,
};
const WORD_LIST = [...valid, ...playable];
const KEYS = ["qwertyuiop", "asdfghjkl", "↵zxcvbnm←"];
const CONGRATULATIONS = ["Genius", "Magnificent", "Impressive", "Splendid", "Great", "Phew"];

const STORAGE_KEY = "@@@PREFACE-WORDLE";
const VARIANT_NAME = "DEFAULT";

const initialState: State = {
    attempts: Array.from({ length: MAX_ATTEMPTS }).map((_) => ""),
    attempt_index: 0,
    evaluation: [],
    status: "in-progress",
    timestamp: new Date(2022, 2, 11).getTime(),
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
};

export { CONGRATULATIONS, LENGTH, MAX_ATTEMPTS, TILES_NODES, TILES_ROWS, KEYBOARD_NODES, RATING, WORD_LIST, playable, KEYS, STORAGE_KEY, VARIANT_NAME, initialState, initialStats, STUDENTS };

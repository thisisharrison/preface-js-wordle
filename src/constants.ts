import type { Evaluation, State } from "./types";

const CONGRATULATIONS = ["Genius", "Magnificent", "Impressive", "Splendid", "Great", "Phew"];

const LENGTH = 5;
const MAX_ATTEMPTS = 6;
const TILES_NODES: HTMLDivElement[] = [];
const KEYBOARD_NODES: HTMLButtonElement[] = [];

const RATING: Record<Evaluation, number> = {
    absent: 0,
    present: 1,
    correct: 2,
};

const ANSWER: string = "apple";

const WORD_LIST = ["apple", "paper", "hello", "world"];

const KEYS = ["qwertyuiop", "asdfghjkl", "↵zxcvbnm←"];

const STORAGE_KEY = "@@@PREFACE-WORDLE";

const initialState: State = {
    attempts: Array.from({ length: MAX_ATTEMPTS }).map((_) => ""),
    attempt_index: 0,
    evaluation: [],
    status: "in-progress",
};

export { CONGRATULATIONS, LENGTH, MAX_ATTEMPTS, TILES_NODES, KEYBOARD_NODES, RATING, ANSWER, WORD_LIST, KEYS, STORAGE_KEY, initialState };

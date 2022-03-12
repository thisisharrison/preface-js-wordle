import { valid, playable } from "./fixtures/words.json";
import type { Evaluation, State } from "./types";

const CONGRATULATIONS = ["Genius", "Magnificent", "Impressive", "Splendid", "Great", "Phew"];

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

const genesis = new Date(2022, 2, 1);
const today = new Date();
const index = Math.floor((today.getTime() - genesis.getTime()) / 86400 / 1000);
const ANSWER: string = playable[index];

const WORD_LIST = [...valid, ...playable];

const KEYS = ["qwertyuiop", "asdfghjkl", "↵zxcvbnm←"];

const STORAGE_KEY = "@@@PREFACE-WORDLE";

const initialState: State = {
    attempts: Array.from({ length: MAX_ATTEMPTS }).map((_) => ""),
    attempt_index: 0,
    evaluation: [],
    status: "in-progress",
};

const STUDENTS = {
    Ellen: "/students/index.html",
    Mark: "/students/index.html",
    Kevin: "/students/index.html",
};

window.answer = ANSWER;

export { CONGRATULATIONS, LENGTH, MAX_ATTEMPTS, TILES_NODES, TILES_ROWS, KEYBOARD_NODES, RATING, ANSWER, WORD_LIST, KEYS, STORAGE_KEY, initialState, STUDENTS };

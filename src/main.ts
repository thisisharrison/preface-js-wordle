import "./style.css";

declare global {
    interface Window {
        state: typeof STATE;
        grid: typeof GRID;
    }
}

type Evaluation = "correct" | "present" | "absent";

interface State {
    attempts: string[];
    attempt_index: number;
    evaluation: Evaluation[][];
    status: "success" | "fail" | "in-progress";
}

const CONGRATULATIONS = ["Genius", "Magnificent", "Impressive", "Splendid", "Great", "Phew"];

const LENGTH = 5;
const MAX_ATTEMPTS = 3;
const TILES_NODES: HTMLDivElement[] = [];
const KEYBOARD_NODES: HTMLButtonElement[] = [];

const RATING: Record<Evaluation, number> = {
    absent: 0,
    present: 1,
    correct: 2,
};

const COLOURS: Record<Evaluation, string> = {
    correct: "#6aaa64",
    present: "#c9b458",
    absent: "#787c7e",
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

let STATE: State = initialState;

let GRID: string[] = Array.from({ length: LENGTH * MAX_ATTEMPTS }).map((_) => "");

function buildGrid() {
    const wrapper = document.createElement("div");
    wrapper.id = "board";
    let row = document.createElement("div");
    row.className = "row";
    GRID.forEach((_, i) => {
        if (i % LENGTH === 0 && i !== 0) {
            wrapper.appendChild(row);
            row = document.createElement("div");
            row.className = "row";
        }
        const tile = document.createElement("div");
        tile.className = "tile";
        TILES_NODES.push(tile);
        row.appendChild(tile);
    });
    wrapper.appendChild(row);
    document.querySelector("#board-container")!.appendChild(wrapper);
}

function buildKeyboard() {
    const wrapper = document.createElement("div");
    wrapper.id = "keyboard";
    for (const keys of KEYS) {
        const keyChars = keys.split("");
        const keyNodes = keyChars.map((key) => {
            const button = document.createElement("button");
            button.innerText = key;
            button.setAttribute("data-key", key);
            button.onclick = handleButtonClick;
            return button;
        });
        const row = document.createElement("div");
        row.className = "row";
        row.append(...keyNodes);
        KEYBOARD_NODES.push(...keyNodes);
        wrapper.append(row);
    }
    document.querySelector("#keyboard-container")!.appendChild(wrapper);
    bindKeyboard();
}

function createToast(message: string, className: "error" | "success" | "fail") {
    const toast = document.createElement("div");
    toast.classList.add("toast", className);
    toast.textContent = message;
    document.body.appendChild(toast);
}

function handleButtonClick(event: MouseEvent) {
    const button = event.currentTarget;
    if (!(button instanceof HTMLButtonElement)) return;
    let key = button.dataset.key;
    if (!key) return;
    if (key === "←") key = "Backspace";
    if (key === "↵") key = "Enter";
    handleKeyboardEvent(key, event);
}

function bindKeyboard() {
    document.addEventListener("keydown", (event) => {
        const key = event.key;
        handleKeyboardEvent(key, event);
    });
}

function handleKeyboardEvent(key: string, event: KeyboardEvent | MouseEvent) {
    console.log(STATE);
    const { attempts, attempt_index, status } = STATE;

    if (status === "success" || status === "fail") return;
    const current_attempt = attempts[attempt_index];
    const current_length = current_attempt.length;

    let next = GRID.findIndex((_) => _ === "");

    if (next === -1) {
        next = GRID.length;
    }
    const regex = new RegExp("^[a-zA-Z]$");

    if (regex.test(key)) {
        if (current_length === LENGTH) return;
        TILES_NODES[next].textContent = key;
        GRID[next] = key;
        attempts[attempt_index] += key;
        return;
    }

    if (key === "Backspace") {
        if (current_attempt === "") return;
        TILES_NODES[next - 1].textContent = "";
        GRID[next - 1] = "";
        attempts[attempt_index] = current_attempt.slice(0, current_length - 1);
    } else if (key === "Enter") {
        if (current_attempt.length < LENGTH) return;
        evaluateAndPaint(current_attempt);
        saveToStorage();
    } else {
        event.preventDefault();
    }
}

function evaluate(string: string) {
    const evaluation: Evaluation[] = ANSWER.split("").map((char, i) => {
        if (string[i] === char) {
            return "correct";
        }
        if (ANSWER.includes(string[i])) {
            return "present";
        }
        return "absent";
    });
    return evaluation;
}

function paintRow(index: number, evaluation: Evaluation[]) {
    const tile_index = index * LENGTH;

    for (let i = tile_index; i < tile_index + LENGTH; i++) {
        const result = evaluation[i % LENGTH];
        TILES_NODES[i].style.color = "#ffffff";
        TILES_NODES[i].style.backgroundColor = COLOURS[result];
    }
}

function evaluateAndPaint(attempt: string) {
    try {
        if (!WORD_LIST.includes(attempt)) {
            throw new Error(`${attempt.toUpperCase()} not in word list`);
        }
        const { attempt_index } = STATE;
        const results = evaluate(attempt);
        STATE.evaluation.push(results);

        paintRow(attempt_index, results);
        updateKeyboard();

        if (ANSWER === attempt) {
            STATE.status = "success";
            createToast(`${CONGRATULATIONS[attempt_index]}!`, "success");
        } else if (attempt_index === MAX_ATTEMPTS - 1) {
            STATE.status = "fail";
            createToast(`The word was ${ANSWER.toUpperCase()}`, "fail");
        } else {
            STATE.attempt_index += 1;
        }
    } catch (error) {
        // @ts-ignore
        createToast(`${error.message}`, "fail");
    }
}

const isNotUndefined = (char: string | undefined): char is string => {
    return !!char;
};

function updateKeyboard() {
    const { evaluation } = STATE;
    const flatEvaluation = evaluation.flatMap((e) => [...e]);
    const chars = GRID.filter(isNotUndefined);
    const summary: Map<string, Evaluation> = new Map();

    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        const currEval = flatEvaluation[i];
        const curr = RATING[currEval];
        const prev = summary.get(char);
        if (!prev) {
            summary.set(chars[i], currEval);
        } else {
            if (curr < RATING[prev]) {
                continue;
            } else if (curr >= RATING[prev]) {
                summary.set(chars[i], currEval);
            }
        }
    }

    KEYBOARD_NODES.forEach((button) => {
        const char = button.innerHTML;
        const status = summary.get(char);
        if (status) {
            button.style.backgroundColor = COLOURS[status];
            button.style.color = "#fff";
        }
    });
}

function attemptsToGrid() {
    GRID = STATE.attempts.flatMap((word) => [...word.split("")]);
    const remaining = Array.from({ length: MAX_ATTEMPTS * LENGTH - GRID.length }).map((_) => "");
    GRID = [...GRID, ...remaining];

    for (let i = 0; i < MAX_ATTEMPTS * LENGTH; i++) {
        TILES_NODES[i].innerText = GRID[i];
    }

    const { evaluation } = STATE;
    for (let i = 0; i < evaluation.length; i++) {
        paintRow(i, evaluation[i]);
    }
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
}

function loadFromStorage() {
    const prevState = localStorage.getItem(STORAGE_KEY);
    if (!prevState) {
        STATE = initialState;
        return false;
    } else {
        STATE = JSON.parse(prevState);
        return true;
    }
}

function syncState() {
    attemptsToGrid();
    updateKeyboard();
}

function startGame() {
    const previous = loadFromStorage();
    buildGrid();
    buildKeyboard();
    if (previous) {
        syncState();
    }
}

startGame();

window.state = STATE;
window.grid = GRID;

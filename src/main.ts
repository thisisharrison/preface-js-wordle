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
const GRID: (undefined | string)[] = Array.from({ length: LENGTH * MAX_ATTEMPTS });
const TILES_NODES: HTMLDivElement[] = [];
const KEYBOARD_NODES: HTMLButtonElement[] = [];

const RATING: Record<Evaluation, number> = {
    absent: 0,
    present: 1,
    correct: 2,
};

const STATE: State = {
    attempts: Array.from({ length: MAX_ATTEMPTS }).map((_) => ""),
    attempt_index: 0,
    evaluation: [],
    status: "in-progress",
};

const COLOURS: Record<Evaluation, string> = {
    correct: "#6aaa64",
    present: "#c9b458",
    absent: "#787c7e",
};

const ANSWER: string = "apple";

const WORD_LIST = ["apple", "paper", "hello", "world"];

const KEYS = ["qwertyuiop", "asdfghjkl", "↵zxcvbnm←"];

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
            return button;
        });
        const row = document.createElement("div");
        row.className = "row";
        row.append(...keyNodes);
        KEYBOARD_NODES.push(...keyNodes);
        wrapper.append(row);
    }
    document.querySelector("#keyboard-container")!.appendChild(wrapper);
}

function bindKeyboard() {
    document.addEventListener("keydown", (event) => {
        console.log(STATE);

        const { attempts, attempt_index, status } = STATE;
        if (status === "success" || status === "fail") return;
        if (attempt_index === MAX_ATTEMPTS) return;
        const current_attempt = attempts[attempt_index];
        const current_length = current_attempt.length;

        const regex = new RegExp("^[a-zA-Z]$");
        const key = event.key;
        let next = GRID.findIndex((_) => _ === undefined);
        if (next === -1) {
            next = GRID.length;
        }

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
            GRID[next - 1] = undefined;
            attempts[attempt_index] = current_attempt.slice(0, current_length - 1);
        } else if (key === "Enter") {
            if (current_attempt.length < LENGTH) return;
            if (attempt_index === MAX_ATTEMPTS) return;
            evaluateAndPaint(current_attempt);
        } else {
            event.preventDefault();
        }
    });
}

function evaluateAttempt(attempt: string) {
    if (!WORD_LIST.includes(attempt)) {
        throw new Error(`${attempt.toUpperCase()} not in word list`);
    } else {
        const evaluation: Evaluation[] = ANSWER.split("").map((char, i) => {
            if (attempt[i] === char) {
                return "correct";
            }
            if (ANSWER.includes(attempt[i])) {
                return "present";
            }
            return "absent";
        });
        STATE.evaluation.push(evaluation);
        return evaluation;
    }
}

function createToast(message: string, className: "error" | "success" | "fail") {
    const toast = document.createElement("div");
    toast.classList.add("toast", className);
    toast.textContent = message;
    document.body.appendChild(toast);
}

function evaluateAndPaint(attempt: string) {
    try {
        const results = evaluateAttempt(attempt);
        const { attempt_index } = STATE;
        const tile_index = attempt_index * LENGTH;

        for (let i = tile_index; i < tile_index + LENGTH; i++) {
            const result = results[i % LENGTH];
            TILES_NODES[i].style.color = "#ffffff";
            TILES_NODES[i].style.backgroundColor = COLOURS[result];
        }

        updateKeyboard();

        const currIndex = STATE.attempt_index;
        if (ANSWER === attempt) {
            STATE.status = "success";
            createToast(`${CONGRATULATIONS[currIndex]}!`, "success");
        } else if (currIndex === MAX_ATTEMPTS - 1) {
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

function startGame() {
    // load from storage if exists
    // update board and keyboard
    buildGrid();
    buildKeyboard();
    bindKeyboard();
}

startGame();

window.state = STATE;
window.grid = GRID;

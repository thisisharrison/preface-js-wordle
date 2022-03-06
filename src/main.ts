import { CONGRATULATIONS, LENGTH, MAX_ATTEMPTS, TILES_NODES, TILES_ROWS, KEYBOARD_NODES, RATING, ANSWER, WORD_LIST, KEYS, STORAGE_KEY, initialState } from "./constants";
import type { Evaluation, State } from "./types";
import "../vendor/css/bootstrap.min.css";
// import "../vendor/css/bootstrap-grid.css";
// import "../vendor/css/bootstrap-reboot.css";
import "../vendor/css/bootstrap-utilities.min.css";
import "./style.css";

declare global {
    interface Window {
        state: typeof STATE;
        grid: typeof GRID;
        answer: string;
    }
}

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
            TILES_ROWS.push(row);
            row = document.createElement("div");
            row.className = "row";
        }
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.dataset["status"] = "empty";
        tile.onanimationend = () => {
            tile.dataset["animation"] = "idle";
        };
        TILES_NODES.push(tile);
        row.appendChild(tile);
    });
    wrapper.appendChild(row);
    TILES_ROWS.push(row);
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
    toast.classList.add("toast", className, "fade");
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 1500);
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
        TILES_NODES[next].dataset["status"] = "tbd";
        TILES_NODES[next].dataset["animation"] = "pop";
        GRID[next] = key;
        attempts[attempt_index] += key;
        return;
    }

    if (key === "Backspace") {
        if (current_attempt === "") return;
        TILES_NODES[next - 1].textContent = "";
        TILES_NODES[next - 1].dataset["status"] = "empty";
        GRID[next - 1] = "";
        attempts[attempt_index] = current_attempt.slice(0, current_length - 1);
    } else if (key === "Enter") {
        // to debug
        console.log(STATE);
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
        TILES_NODES[i].dataset["animation"] = "flip";
        TILES_NODES[i].style.animationDelay = `${(i % LENGTH) * 400}ms`;
        TILES_NODES[i].onanimationstart = () => {
            setTimeout(() => (TILES_NODES[i].dataset["status"] = result), 250);
        };
    }
}

function bounce() {
    const { attempt_index } = STATE;
    const start = attempt_index * LENGTH;
    for (let i = start; i < start + 5; i++) {
        TILES_NODES[i].dataset["animation"] = "win";
        TILES_NODES[i].style.animationDelay = `${(i % LENGTH) * 100}ms`;
    }
}

function evaluateAndPaint(attempt: string) {
    const { attempt_index } = STATE;
    try {
        if (!WORD_LIST.includes(attempt)) {
            throw new Error(`${attempt.toUpperCase()} not in word list`);
        }
        const results = evaluate(attempt);
        STATE.evaluation.push(results);

        paintRow(attempt_index, results);
        updateKeyboard();

        if (ANSWER === attempt) {
            STATE.status = "success";

            setTimeout(() => {
                bounce();
                createToast(`${CONGRATULATIONS[attempt_index]}!`, "success");
            }, (LENGTH + 1) * 400);
        } else if (attempt_index === MAX_ATTEMPTS - 1) {
            STATE.status = "fail";
            createToast(`The word was ${ANSWER.toUpperCase()}`, "fail");
        } else {
            STATE.attempt_index += 1;
        }
    } catch (error) {
        // @ts-ignore
        createToast(`${error.message}`, "fail");
        TILES_ROWS[attempt_index].dataset["status"] = "invalid";
        TILES_ROWS[attempt_index].onanimationend = (event) => {
            if (event.animationName === "Shake") {
                TILES_ROWS[attempt_index].removeAttribute("data-status");
            }
        };
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
            button.dataset["status"] = status;
        }
    });
}

function attemptsToGrid() {
    GRID = STATE.attempts.flatMap((word) => [...word.split("")]);
    const remaining = Array.from({ length: MAX_ATTEMPTS * LENGTH - GRID.length }).map((_) => "");
    GRID = [...GRID, ...remaining];

    for (let i = 0; i < MAX_ATTEMPTS * LENGTH; i++) {
        TILES_NODES[i].innerText = GRID[i];
        TILES_NODES[i].dataset["status"] = "reveal";
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

// @ts-ignore -- for debug
document.querySelector("#clear").onclick = () => window.localStorage.clear();

window.state = STATE;
window.grid = GRID;

import { CONGRATULATIONS, LENGTH, MAX_ATTEMPTS, TILES_NODES, TILES_ROWS, KEYBOARD_NODES, RATING, ANSWER, WORD_LIST, KEYS, STORAGE_KEY, initialState } from "./constants";
import type { Evaluation, State } from "./types";
// import "../vendor/css/bootstrap.min.css";
// import "../vendor/css/bootstrap-grid.css";
// import "../vendor/css/bootstrap-reboot.css";
// import "../vendor/css/bootstrap-utilities.min.css";
import "./style.css";

declare global {
    interface Window {
        state: typeof STATE;
        grid: typeof GRID;
        answer: string;
    }
}

let STATE: State = initialState;

let GRID: string[] = [];

function buildGrid(length: number, maxLength: number) {
    const wrapper = document.createElement("div");
    wrapper.id = "board";
    let row = document.createElement("div");
    row.className = "row";
    GRID = Array.from({ length: length * maxLength }).map((_) => "");
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
    for (let i = 0; i < KEYS.length; i++) {
        let keys = KEYS[i];
        const keyChars = keys.split("");
        const keyNodes: HTMLButtonElement[] = keyChars.map((key) => {
            const button = document.createElement("button");
            if (key === "↵") {
                button.innerText = "enter";
            } else if (key === "←") {
                button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="var(--color-tone-1)" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"></path></svg>`;
            } else {
                button.innerText = key;
            }
            button.setAttribute("data-key", key);
            return button;
        });
        const row = document.createElement("div");
        row.className = "row";
        KEYBOARD_NODES.push(...keyNodes);
        if (i === 1) {
            const leftHalf = document.createElement("span");
            const rightHalf = document.createElement("span");
            leftHalf.className = "half";
            rightHalf.className = "half";
            const newKeyNodes = [leftHalf, ...keyNodes, rightHalf];
            row.append(...newKeyNodes);
        } else {
            row.append(...keyNodes);
        }
        wrapper.append(row);
    }
    wrapper.addEventListener("click", handleKeyboardEvent);
    document.querySelector("#keyboard-container")!.appendChild(wrapper);
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

function bindKeyboard() {
    document.addEventListener("keydown", handleKeyboardEvent);
    const keyboard: HTMLDivElement = document.querySelector("#keyboard")!;
    keyboard.addEventListener("click", handleKeyboardEvent);
    console.log("bound");
}

function unbindKeyboard() {
    document.removeEventListener("keydown", handleKeyboardEvent);
    const keyboard: HTMLDivElement = document.querySelector("#keyboard")!;
    keyboard.removeEventListener("click", handleKeyboardEvent);
    console.log("unbound");
}

function isKeyboardEvent(event: KeyboardEvent | MouseEvent): event is KeyboardEvent {
    return event.type === "keydown";
}

function isClickEvent(event: KeyboardEvent | MouseEvent): event is MouseEvent {
    return event.type === "click";
}

function handleKeyboardEvent(event: KeyboardEvent | MouseEvent) {
    let key = "";
    if (isKeyboardEvent(event)) {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
            return;
        } else {
            key = event.key;
        }
    } else if (isClickEvent(event)) {
        const button = event.target;
        if (!(button instanceof HTMLButtonElement)) return;
        key = button.dataset.key!;
        if (!key) return;
        if (key === "←") key = "Backspace";
        if (key === "↵") key = "Enter";
    }

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
    unbindKeyboard();

    for (let i = tile_index; i < tile_index + LENGTH; i++) {
        const result = evaluation[i % LENGTH];
        TILES_NODES[i].dataset["animation"] = "flip";
        TILES_NODES[i].style.animationDelay = `${(i % LENGTH) * 400}ms`;
        TILES_NODES[i].onanimationstart = () => {
            setTimeout(() => (TILES_NODES[i].dataset["status"] = result), 250);
        };
    }
    setTimeout(() => {
        bindKeyboard();
    }, 500 * LENGTH);
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
        saveToStorage();
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

function attemptsToGrid(length: number, maxLength: number) {
    GRID = STATE.attempts.flatMap((word) => [...word.split("")]);
    const remaining = Array.from({ length: length * maxLength - GRID.length }).map((_) => "");
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

export function loadFromStorage(): null | State {
    const prevState = localStorage.getItem(STORAGE_KEY);
    if (!prevState) {
        return null;
    } else {
        return JSON.parse(prevState);
    }
}

function syncState(length: number, maxLength: number) {
    attemptsToGrid(length, maxLength);
    updateKeyboard();
}

function startGame(length: number, maxLength: number) {
    const prevState = loadFromStorage();
    STATE = prevState || initialState;
    buildGrid(length, maxLength);
    buildKeyboard();
    bindKeyboard();
    if (prevState) {
        syncState(length, maxLength);
    }
}

startGame(LENGTH, MAX_ATTEMPTS);

window.state = STATE;
window.grid = GRID;

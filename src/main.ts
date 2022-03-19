import { WORD_LENGTH, MAX_ATTEMPTS, ANSWER, CONGRATULATIONS, RATING, WORD_LIST, initialState, initialStats } from "./constants";
import { updateStatModal } from "./stat";
import type { Evaluation, State, Statistic } from "./types";
import "./style.css";

const TOTAL_TILES = WORD_LENGTH * MAX_ATTEMPTS;
const TILES = Array.from({ length: WORD_LENGTH * MAX_ATTEMPTS }).map((_) => "");
const TILES_NODES: HTMLDivElement[] = [];
const TILES_ROWS: HTMLDivElement[] = [];
const KEYS = ["qwertyuiop", "asdfghjkl", "↵zxcvbnm←"];
const KEYBOARD: HTMLDivElement = document.createElement("div");
const KEYBOARD_NODES: HTMLButtonElement[] = [];

let STATE = initialState;

/** Game start logic */
function startGame() {
    buildArtifacts();
    const prevGame = loadFromStorage("@@@PREFACE_WORDLE_GAME", initialState, isGameValid);
    reloadGame(prevGame);
    STATE = prevGame;
    window.state = STATE;
    startInteraction();
}

/** Load previous game from storage */
function reloadGame(prevGame: State) {
    const { attempts, evaluation } = prevGame;
    const prevTiles = attempts.flatMap((word) => [...word.split("")]);
    for (let i = 0; i < prevTiles.length; i++) {
        const char = prevTiles[i];
        TILES[i] = char;
        TILES_NODES[i].textContent = char;
        TILES_NODES[i].dataset["status"] = "reveal";
    }

    for (let i = 0; i < evaluation.length; i++) {
        paintGame(i, evaluation[i]);
    }
}

/** Can be skipped if student's template has the board and keyboard HTML */
function buildArtifacts() {
    buildBoard();
    buildKeyboard();
}

function buildBoard() {
    const wrapper = document.createElement("div");
    wrapper.id = "board";
    let row = document.createElement("div");
    row.className = "row";
    TILES.forEach((_, i) => {
        if (i % WORD_LENGTH === 0 && i !== 0) {
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
    KEYBOARD.id = "keyboard";
    for (let i = 0; i < KEYS.length; i++) {
        let keys = KEYS[i];
        const keyChars = keys.split("");
        const keyNodes: HTMLButtonElement[] = keyChars.map((key) => {
            const button = document.createElement("button");
            if (key === "↵") {
                button.innerText = "enter";
                button.setAttribute("data-key", "Enter");
                button.classList.add("one-and-a-half");
            } else if (key === "←") {
                button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="var(--color-tone-1)" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"></path></svg>`;
                button.setAttribute("data-key", "Backspace");
                button.classList.add("one-and-a-half");
            } else {
                button.innerText = key;
                button.setAttribute("data-key", key);
            }
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
        KEYBOARD.append(row);
    }
    document.querySelector("#keyboard-container")!.appendChild(KEYBOARD);
}

function createToast(message: string, className: "error" | "success" | "fail") {
    const toast = document.createElement("div");
    toast.classList.add("toast", className, "fade");
    toast.textContent = message;
    document.body.appendChild(toast);
    hideToast(toast);
}

function hideToast(toast: HTMLDivElement) {
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 1500);
}

/** Bind events */
function startInteraction() {
    KEYBOARD.addEventListener("click", handleClickEvent);
    document.addEventListener("keydown", handlePressEvent);
}

/** Unbind events during animation */
function stopInteraction() {
    KEYBOARD.removeEventListener("click", handleClickEvent);
    document.removeEventListener("keydown", handlePressEvent);
}

/** Button click events */
function handleClickEvent(event: MouseEvent) {
    const button = event.target;
    if (!(button instanceof HTMLButtonElement)) {
        return;
    }
    let key = button.dataset.key;
    if (!key) {
        return;
    }
    pressKey(key);
}

/** Keyboard press events */
function handlePressEvent(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
        return;
    }
    const key = event.key;
    pressKey(key);
}

/** Update TILES and TILES_NODES */
function pressKey(key: string) {
    const { attempts, attempt_index, status } = STATE;

    if (status === "success" || status === "fail") return;
    const current_attempt = attempts[attempt_index];
    const current_length = current_attempt.length;

    let next = TILES.findIndex((_) => _ === "");

    if (next === -1) {
        next = TOTAL_TILES;
    }
    const regex = new RegExp("^[a-zA-Z]$");

    if (regex.test(key)) {
        if (current_length === WORD_LENGTH) return;
        const nextTile = TILES_NODES[next];
        nextTile.textContent = key;
        nextTile.dataset["status"] = "tbd";
        nextTile.dataset["animation"] = "pop";
        TILES[next] = key;
        attempts[attempt_index] += key;
        return;
    }

    if (key === "Backspace" || key === "Delete") {
        if (current_attempt === "") return;
        const lastTile = TILES_NODES[next - 1];
        lastTile.textContent = "";
        lastTile.dataset["status"] = "empty";
        TILES[next - 1] = "";
        attempts[attempt_index] = current_attempt.slice(0, current_length - 1);
        return;
    }

    if (key === "Enter") {
        if (current_attempt.length < WORD_LENGTH) return;
        submitAttempt(current_attempt);
        return;
    }
}

/** Return evaluation of the string against ANSWER */
function evaluateWord(string: string) {
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

/** Paint and animate the guess */
function submitAttempt(attempt: string) {
    const { attempt_index } = STATE;
    if (!WORD_LIST.includes(attempt)) {
        shake(attempt, attempt_index);
        return;
    }
    const wordEvaluation = evaluateWord(attempt);
    STATE.evaluation.push(wordEvaluation);

    if (ANSWER === attempt) {
        STATE.status = "success";
    } else if (attempt_index === MAX_ATTEMPTS - 1) {
        STATE.status = "fail";
    } else {
        STATE.attempt_index += 1;
    }

    paintGame(attempt_index, wordEvaluation);

    saveToStorage("@@@PREFACE_WORDLE_GAME", STATE);

    if (STATE.status !== "in-progress") {
        updateStats();
    }
}

function paintGame(attempt_index: number, evaluation: Evaluation[]) {
    stopInteraction();
    paint(attempt_index, evaluation);
    setTimeout(() => {
        startInteraction();
    }, 500 * WORD_LENGTH);
}

function paint(index: number, evaluation: Evaluation[]) {
    const tileIndex = index * WORD_LENGTH;
    const length = tileIndex + WORD_LENGTH;

    for (let i = tileIndex; i < length; i++) {
        const charIndex = i % WORD_LENGTH;
        const status = evaluation[charIndex];
        const key = TILES_NODES[i].textContent!;
        TILES_NODES[i].dataset["animation"] = "flip";
        TILES_NODES[i].style.animationDelay = `${charIndex * 400}ms`;
        TILES_NODES[i].onanimationstart = () => {
            setTimeout(() => (TILES_NODES[i].dataset["status"] = status), 250);
            setTimeout(() => paintKey(key, status), 250);
        };
        if (i === length - 1 && STATE.status === "success") {
            TILES_NODES[i].onanimationend = bounce;
        }
        if (i === length - 1 && STATE.status === "fail") {
            TILES_NODES[i].onanimationend = () => {
                createToast(`The word was ${ANSWER.toUpperCase()}`, "fail");
            };
        }
    }
}

function paintKey(key: string, status: Evaluation) {
    const node = KEYBOARD_NODES.find((button) => {
        const char = button.innerHTML;
        return char === key;
    })!;
    const prevStatus = node.dataset["status"] as Evaluation | undefined;
    if (prevStatus && RATING[prevStatus] > RATING[status]) {
        return;
    } else {
        node.dataset["status"] = status;
    }
}

function shake(attempt: string, attempt_index: number) {
    createToast(`${attempt.toUpperCase()} not in word list`, "fail");
    TILES_ROWS[attempt_index].dataset["status"] = "invalid";
    TILES_ROWS[attempt_index].onanimationend = (event) => {
        if (event.animationName === "Shake") {
            TILES_ROWS[attempt_index].removeAttribute("data-status");
        }
    };
}

function bounce() {
    const { attempt_index } = STATE;
    const start = attempt_index * WORD_LENGTH;
    const length = start + WORD_LENGTH;

    for (let i = start; i < length; i++) {
        TILES_NODES[i].dataset["animation"] = "win";
        TILES_NODES[i].style.animationDelay = `${(i % WORD_LENGTH) * 100}ms`;

        if (i === length - 1) {
            TILES_NODES[i].onanimationend = () => {
                createToast(`${CONGRATULATIONS[attempt_index]}!`, "success");
            };
        }
    }
}

/**
 * Evaluate if it should be a new game
 * Wordle's rule is one game per day, but we can customize it here
 * */
function isGameValid(state: State) {
    const { timestamp } = state;
    return isToday(timestamp);
}

function isToday(timestamp: Date) {
    const today = new Date();
    const check = new Date(timestamp);
    return today.toDateString() === check.toDateString();
}

/** Load previous game conditionally */
export function loadFromStorage(key: string, initialItem: State | Statistic, shouldRender?: (state: State) => boolean) {
    const item = localStorage.getItem(key);
    if (!item) {
        saveToStorage(key, initialItem);
        return initialItem;
    }
    const parsedItem = JSON.parse(item);
    if (!shouldRender) {
        return parsedItem;
    } else if (shouldRender(parsedItem)) {
        return parsedItem;
    }
}

/** Save game */
function saveToStorage(key: string, item: any) {
    localStorage.setItem(key, JSON.stringify(item));
}

function updateStats() {
    const prevStats = loadFromStorage("@@@PREFACE_WORDLE_STATS", initialStats);
    prevStats.gamesPlayed += 1;
    if (STATE.status === "success") {
        const newGuessCount = prevStats.guesses[STATE.attempt_index + 1] + 1;
        prevStats.gamesWon += 1;
        prevStats.winPercentage = Math.round((prevStats.gamesWon / prevStats.gamesPlayed) * 100);
        prevStats.guesses = { ...prevStats.guesses, [STATE.attempt_index + 1]: newGuessCount };
        prevStats.currentStreak += 1;
        prevStats.maxStreak = Math.max(prevStats.maxStreak, prevStats.currentStreak);
        prevStats.averageGuesses =
            Object.keys(prevStats.guesses).reduce((acc, cur) => {
                if (cur === "fail") return acc;
                acc += prevStats.guesses[cur];
                return acc;
            }, 0) / WORD_LENGTH;
    } else if (STATE.status === "fail") {
        prevStats.guesses = { ...prevStats.guesses, fail: ++prevStats.guesses.fail };
        prevStats.currentStreak = 0;
        prevStats.winPercentage = Math.round((prevStats.gamesWon / prevStats.gamesPlayed) * 100);
    }
    saveToStorage("@@@PREFACE_WORDLE_STATS", prevStats);
    updateStatModal(prevStats);
}

startGame();

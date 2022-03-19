import { buildArtifacts } from "./util";
import wordList from "./words.json";
import type { Evaluation } from "../../src/types";
import "../../src/style.css";
import "./nba.css";

const WORD_LIST = wordList.map((team) => team.toLowerCase());
const ANSWER_INDEX = Math.floor(Math.random() * WORD_LIST.length);
const ANSWER = "raptors"; // WORD_LIST[ANSWER_INDEX];
const LENGTH = ANSWER.length;
const MAX_ATTEMPTS = 4;
const TOTAL = LENGTH * MAX_ATTEMPTS;

const TILES = Array.from({ length: TOTAL }).map((_) => "");
const [TILES_NODES, TILES_ROWS] = buildArtifacts(TILES, LENGTH);
console.log("TILE_NODES", TILES_NODES);

const KEYS = ["qwertyuiop", "asdfghjkl", "↵zxcvbnm←"];
const KEYBOARD: HTMLDivElement = document.querySelector("#keyboard");
const KEYBOARD_NODES: HTMLButtonElement[] = Array.from(document.querySelectorAll("[data-key]"));

const RATING: Record<Evaluation, number> = {
    absent: 0,
    present: 1,
    correct: 2,
};

class Game {
    attempts: string[];
    status: "in-progress" | "win" | "lost";
    evaluations: Evaluation[][];
    answer: string;
    keyboard: Keyboard;
    board: Board;
    currentAttempt: Attempt;

    constructor() {
        this.attempts = [];
        this.status = "in-progress";
        this.evaluations = [];
        this.answer = ANSWER;
        this.keyboard = new Keyboard(this);
        this.board = new Board(this);
        this.currentAttempt = new Attempt(this);
    }

    get currentAttemptIdx() {
        if (this.attempts.length === 0) {
            return 0;
        } else if (this.attempts.length === MAX_ATTEMPTS) {
            return LENGTH - 1;
        }
        return this.attempts.length - 1;
    }

    get lastAttempt() {
        const idx = this.currentAttemptIdx;
        return this.attempts[idx];
    }

    get lastEvaluation() {
        const idx = this.evaluations.length - 1;
        return this.evaluations[idx];
    }

    set newAttempts(newAttempts: string[]) {
        this.attempts = newAttempts;
    }

    isOver() {
        return this.status !== "in-progress" || this.attempts.length === MAX_ATTEMPTS;
    }

    evaluateAttempt() {
        const result = this.currentAttempt.evaluate();
        this.evaluations.push(result);
    }

    evaluateKeyboard() {
        this.keyboard.evaluate();
    }
}

class Board {
    nodes: HTMLDivElement[];
    rows: HTMLDivElement[];
    game: Game;

    constructor(game: Game) {
        this.nodes = TILES_NODES;
        this.rows = TILES_ROWS;
        this.game = game;
    }

    get nextIdx() {
        const idx = this.nodes.findIndex((tile) => tile.textContent === "");
        return idx;
    }

    get nextTile() {
        const idx = this.nextIdx;
        return this.nodes[idx];
    }

    get lastTile() {
        const idx = this.nextIdx;
        return this.nodes[idx - 1];
    }

    flip() {
        const tileIdx = this.game.currentAttemptIdx * LENGTH;
        const evaluation = this.game.evaluations[this.game.currentAttemptIdx];
        for (let i = tileIdx; i < tileIdx + LENGTH; i++) {
            const charIndex = i % LENGTH;
            const result = evaluation[charIndex];
            const key = this.nodes[i].textContent;
            this.nodes[i].dataset["animation"] = "flip";
            this.nodes[i].style.animationDelay = `${charIndex * 400}ms`;
            this.nodes[i].onanimationstart = () => {
                setTimeout(() => (this.nodes[i].dataset["status"] = result), 250);
            };
        }
    }

    shake() {
        const rowIdx = this.game.currentAttemptIdx;
        this.rows[rowIdx].dataset["status"] = "invalid";
        this.rows[rowIdx].onanimationend = (event) => {
            if (event.animationName === "Shake") {
                this.rows[rowIdx].removeAttribute("data-status");
            }
        };
    }

    bounce() {
        const start = this.game.currentAttemptIdx * LENGTH;
        for (let i = start; i < start + LENGTH; i++) {
            this.nodes[i].dataset["animation"] = "win";
            this.nodes[i].style.animationDelay = `${(i % LENGTH) * 100}ms`;
        }
    }

    pop() {
        const next = this.nextTile;
        next.dataset["status"] = "tbd";
        next.dataset["animation"] = "pop";
    }

    empty() {
        const last = this.lastTile;
        last.dataset["status"] = "empty";
    }
}

class Attempt {
    game: Game;
    guess: string;

    constructor(game: Game) {
        this.game = game;
        this.guess = "";
    }

    set addChar(char: string) {
        if (this.guess.length === LENGTH) {
            return;
        }
        this.guess += char;
        this.game.board.pop();
        this.game.board.nextTile.textContent = char;
    }

    delete() {
        if (this.guess.length === 0) {
            return;
        }
        this.guess = this.guess.slice(0, this.guess.length - 1);
        this.game.board.empty();
        this.game.board.lastTile.textContent = "";
    }

    isValid() {
        return WORD_LIST.includes(this.guess);
    }

    submit() {
        if (!this.isValid()) {
            this.game.board.shake();
            alert(`${this.guess} is not in the NBA`);
            return;
        }
        if (this.game.isOver()) {
            alert("Game over");
            return;
        }
        this.game.newAttempts = [...this.game.attempts, this.guess];
        this.game.evaluateAttempt();
        this.game.board.flip();
        if (this.guess === this.game.answer) {
            this.game.status = "win";
            setTimeout(() => {
                this.game.board.bounce();
            }, 500 * LENGTH);
        } else if (this.game.isOver()) {
            this.game.status = "lost";
            alert(`The word is ${this.game.answer}`);
        }
        this.reset();
    }

    evaluate() {
        const evaluation = [];
        for (let i = 0; i < LENGTH; i++) {
            if (this.guess[i] === this.game.answer[i]) {
                evaluation.push("correct");
            } else if (this.game.answer.includes(this.guess[i])) {
                evaluation.push("present");
            } else {
                evaluation.push("absent");
            }
        }
        return evaluation;
    }

    reset() {
        this.guess = "";
        this.game.currentAttempt = new Attempt(this.game);
    }
}

class Keyboard {
    nodes: HTMLButtonElement[];
    game: Game;
    map: Map<string, Evaluation | "">;

    constructor(game: Game) {
        this.nodes = KEYBOARD_NODES;
        this.game = game;
        this.map = KEYS.flatMap((row) => [...row.split("")]).reduce((acc, cur) => {
            if ("↵←".includes(cur)) return acc;
            return acc.set(cur, "");
        }, new Map());
        this.startInteraction();
        // this.pressKey = this.pressKey.bind(this);
        // stopInteraction
    }

    evaluate() {
        const word = this.game.lastAttempt;
        const evaluation = this.game.lastEvaluation;

        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            const newState = evaluation[i];
            const prevState = this.map.get(char);
            if (prevState === "") {
                this.map.set(char, newState);
            } else {
                const prevRating = RATING[prevState];
                const newRating = RATING[newState];
                if (newRating < prevRating) {
                    return;
                } else if (newRating > prevRating) {
                    this.map.set(char, newState);
                }
            }
            const index = this.nodes.findIndex((button) => {
                const char = button.innerHTML;
                return char === char;
            });
            this.nodes[index].dataset["status"] = this.map.get(char);
        }
    }

    startInteraction() {
        KEYBOARD.addEventListener("click", (e) => this.handleClickEvent(e));
        document.addEventListener("keydown", (e) => this.handlePressEvent(e));
        console.log("Interaction started");
    }

    stopInteraction() {
        KEYBOARD.removeEventListener("click", this.handleClickEvent);
        document.removeEventListener("keydown", this.handlePressEvent);
        console.log("Interaction stopped");
    }

    pressKey(key: string) {
        if (this.game.isOver()) return;

        const regex = new RegExp("^[a-zA-Z]$");

        if (regex.test(key)) {
            this.game.currentAttempt.addChar = key;
            return;
        }

        if (key === "Backspace") {
            this.game.currentAttempt.delete();
            return;
        }

        if (key === "Enter") {
            this.game.currentAttempt.submit();
            return;
        }
    }

    handleClickEvent(event: MouseEvent) {
        const button = event.target;
        if (!(button instanceof HTMLButtonElement)) {
            return;
        }
        let key = button.dataset.key;
        if (!key) {
            return;
        }
        if (key === "←") {
            key = "Backspace";
        }
        if (key === "↵") {
            key = "Enter";
        }
        this.pressKey(key);
    }

    handlePressEvent(event: KeyboardEvent) {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
            return;
        }
        const key = event.key;
        this.pressKey(key);
    }
}

window.g = new Game();

declare global {
    interface Window {
        g: Game;
    }
}

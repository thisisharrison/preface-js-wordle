import { initialState, initialStats } from "./constants";
import { loadFromStorage } from "./main";
import type { Statistic } from "./types";

function createSummary(stats: Statistic) {
    const summary = summaryTemplate(stats);
    const graphData = createGraphData(stats.guesses);
    const distribution = distributionTemplate(graphData);
    const footer = footerTemplate();
    return summary + distribution + footer;
}

export function updateStatModal(stats: Statistic) {
    document.querySelector("#stat-modal-body")!.innerHTML = createSummary(stats);
    bindShareButton();
}

function bindShareButton() {
    const share = document.getElementById("share-button")! as HTMLButtonElement;
    share.addEventListener("click", createShareableSummary);
}

const summaryTemplate = ({ gamesPlayed, winPercentage, currentStreak, maxStreak }: Statistic) => {
    return `<div id="statistics">
        <div class="statistic-container">
            <div class="statistic">${gamesPlayed}</div>
            <div class="label">Played</div>
        </div>
    
        <div class="statistic-container">
            <div class="statistic">${winPercentage}</div>
            <div class="label">Win %</div>
        </div>
    
        <div class="statistic-container">
            <div class="statistic">${currentStreak}</div>
            <div class="label">Current Streak</div>
        </div>
    
        <div class="statistic-container">
            <div class="statistic">${maxStreak}</div>
            <div class="label">Max Streak</div>
        </div>
    </div>`;
};

const createDistribution = (guess: number, numGuess: number, max: number) => `
<div class="graph-container" id="graph-container">
    <div class="guess">${guess}</div>
    <div class="graph">
        <div class="graph-bar align-right ${numGuess > 0 ? "highlight" : ""}" style="width: ${numGuess === 0 ? 7 : (numGuess / max) * 100}%">
            <div class="num-guesses">${numGuess}</div>
        </div>
    </div>
</div>
`;

const createGraphData = (stat: Record<string, number>) => {
    const max = Math.max(...Object.values(stat));
    return Object.entries(stat).reduce((acc, cur) => {
        const [guess, numGuess] = cur;
        if (isNaN(Number(guess))) return acc;
        acc += createDistribution(Number(guess), numGuess, max);
        return acc;
    }, "");
};

const distributionTemplate = (graphData: string) => `
<div id="distribution">
<h1>Guess Distribution</h1>
</div>
<div id="guess-distribution">
    ${graphData}
</div>`;

const prettyTime = (num: number) => {
    const parseTime = (num: number) => (num < 10 ? "0" + num : num);
    const hr = parseTime(Math.floor((num % (60 * 60 * 24)) / (60 * 60)));
    const min = parseTime(Math.floor((num % (60 * 60)) / 60));
    const sec = parseTime(Math.floor(num % 60));

    return `${hr}:${min}:${sec}`;
};

const footerTemplate = () => {
    const currTime = new Date().getTime() / 1000;
    const time = prettyTime(currTime);
    return `
    <div class="footer">
        <div class="countdown">
        <h1>Next WORDLE</h1>
        <div id="timer">
            <div class="statistic-container">
                <div class="statistic timer">${time}</div>
            </div>
        </div>
        </div>
        <div class="share">
            <button id="share-button">
                Share
                <i class="bi bi-share"></i>
            </button>
        </div>
    </div>`;
};

function createShareableSummary() {
    const data = loadFromStorage("@@@PREFACE_WORDLE_GAME", initialState);
    console.log("here");
    if (!data) {
        alert("No data");
        return;
    }
    let shareText = "";
    for (const row of data.evaluation) {
        let rowString = ``;
        for (const status of row) {
            switch (status) {
                case "absent":
                    rowString += "⬛";
                    break;
                case "present":
                    rowString += "🟨";
                    break;
                case "correct":
                    rowString += "🟩";
                    break;
            }
        }
        rowString += "\n";
        shareText += rowString;
    }

    alert(shareText);
    copyText(shareText);
}

function copyText(text: string) {
    const element = document.createElement("textarea");
    element.value = text;
    element.style.position = "absolute";
    element.style.left = "-9999px";
    element.setAttribute("readonly", "");
    document.body.appendChild(element);

    const selection = document.getSelection();
    const selected = selection != null && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    element.select();
    document.execCommand("copy");
    document.body.removeChild(element);

    if (selection && selected) {
        selection.removeAllRanges();
        selection.addRange(selected);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const prevStats = loadFromStorage("@@@PREFACE_WORDLE_STATS", initialStats);
    updateStatModal(prevStats);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    let distance = tomorrow.getTime() / 1000 - today.getTime() / 1000;

    setInterval(() => {
        const time = prettyTime(distance);
        document.querySelector(".statistic.timer")!.textContent = time;
        distance -= 1;
    }, 1000);
});

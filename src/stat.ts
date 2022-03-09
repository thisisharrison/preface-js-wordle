import { loadFromStorage } from "./main";
import { Statistic } from "./types";

const summaryTemplate = ({ gamesPlayed, gamesWon, currentStreak, maxStreak }: typeof mockData) => {
    const winRate = gamesWon / gamesPlayed;
    return `<div id="statistics">
        <div class="statistic-container">
            <div class="statistic">${gamesPlayed}</div>
            <div class="label">Played</div>
        </div>
    
        <div class="statistic-container">
            <div class="statistic">${winRate}</div>
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
<div class="graph-container">
    <div class="guess">${guess}</div>
    <div class="graph">
        <div class="graph-bar align-right ${numGuess > 0 ? "highlight" : ""}" style="width: ${numGuess === 0 ? 7 : (numGuess / max) * 100}%">
            <div class="num-guesses">${numGuess}</div>
        </div>
    </div>
</div>
`;

const createGraphData = (stat: Statistic) => {
    const max = Math.max(...Object.values(stat));
    return Object.entries(stat).reduce((acc, cur) => {
        const [guess, numGuess] = cur;
        if (isNaN(Number(guess))) return acc;
        acc += createDistribution(Number(guess), numGuess, max);
        return acc;
    }, "");
};

const distributionTemplate = (graphData: string) => `
<div>
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

const mockData = {
    averageGuesses: 3,
    currentStreak: 1,
    gamesPlayed: 1,
    gamesWon: 1,
    guesses: { 1: 0, 2: 0, 3: 1, 4: 0, 5: 0, 6: 0, fail: 0 },
    maxStreak: 1,
    winPercentage: 100,
} as const;

function createSummary(detail: typeof mockData) {
    const summary = summaryTemplate(detail);
    const graphData = createGraphData(detail.guesses);
    const distribution = distributionTemplate(graphData);
    const footer = footerTemplate();
    return summary + distribution + footer;
}

function createShareableSummary() {
    const history = loadFromStorage();
    if (!history) {
        alert("No data");
        return;
    }
    let shareText = "";
    for (const row of history.evaluation) {
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
    document.querySelector("#stat-modal-body")!.innerHTML = createSummary(mockData);

    const share: HTMLButtonElement = document.querySelector("#share-button")!;
    share.onclick = createShareableSummary;
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

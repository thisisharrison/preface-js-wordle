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
        <div class="graph-bar align-right highlight" style="width: ${numGuess === 0 ? 7 : (numGuess / max) * 100}%">
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
<h1>Guess Distribution</h1>
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
            <button id="share-button">Share</button>
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
};

document.addEventListener("DOMContentLoaded", () => {
    const summary = summaryTemplate(mockData);

    const graphData = createGraphData(mockData.guesses);
    const distribution = distributionTemplate(graphData);

    const footer = footerTemplate();

    document.querySelector("#stat-modal-body")!.innerHTML = summary + distribution + footer;

    setInterval(() => {
        // Calculate next game time
        const currTime = new Date().getTime() / 1000;
        const time = prettyTime(currTime);
        document.querySelector(".statistic.timer")!.textContent = time;
    }, 1000);
});

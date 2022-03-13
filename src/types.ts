type Evaluation = "correct" | "present" | "absent";

interface State {
    attempts: string[];
    attempt_index: number;
    evaluation: Evaluation[][];
    status: "success" | "fail" | "in-progress";
    timestamp: Date;
}

interface Statistic {
    averageGuesses: number;
    currentStreak: number;
    gamesPlayed: number;
    gamesWon: number;
    guesses: Record<string, number>;
    maxStreak: number;
    winPercentage: number;
}

export type { Evaluation, State, Statistic };

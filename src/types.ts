type Evaluation = "correct" | "present" | "absent";

interface State {
    attempts: string[];
    attempt_index: number;
    evaluation: Evaluation[][];
    status: "success" | "fail" | "in-progress";
}

interface Statistic {
    [key: string]: number;
}

export type { Evaluation, State, Statistic };

type Evaluation = "correct" | "present" | "absent";

interface State {
    attempts: string[];
    attempt_index: number;
    evaluation: Evaluation[][];
    status: "success" | "fail" | "in-progress";
}

export type { Evaluation, State };

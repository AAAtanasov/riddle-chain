import { RiddleModel } from "./riddle.model";

export interface LLMService {
    getRiddle(): Promise<RiddleModel>;
};
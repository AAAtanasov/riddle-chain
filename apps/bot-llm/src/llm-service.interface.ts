import { RiddleModel } from "./riddle/riddle.model";

export interface LLMService {
    generateRiddle(): Promise<RiddleModel>;
};
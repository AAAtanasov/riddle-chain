import { RiddleModel } from "./riddle/riddle.model";

export interface LLMService {
        generateRiddle(oldRiddle: string): Promise<RiddleModel>;
};
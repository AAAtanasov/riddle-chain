import { ethers } from "ethers";
import { OnchainRiddle } from "../lib/typechain-types";
import { LLMService } from "../llm-service.interface";
import { OpenAiService } from "../openai-llm/openai.service";
import { RiddleModel } from "./riddle.model";


export class RiddleService {
    public static async setNewRiddle(openAIAPiKey: string, contract: OnchainRiddle): Promise<void> {
        try {
            const isRiddleSet = await contract.isActive();
            if (isRiddleSet) {
                console.log("Riddle is already set. Exiting...");
                return;
            }

            const llmService: LLMService = new OpenAiService(openAIAPiKey);

            const oldRiddle: string = await contract.riddle();

            const riddle: RiddleModel = await llmService.generateRiddle(oldRiddle);
            if (!riddle || !riddle.question || !riddle.answer) {
                throw new Error("Failed to generate riddle with complete question and answer");
            }

            const answerBytes = ethers.toUtf8Bytes(riddle.answer);
            const answerHash = ethers.keccak256(answerBytes);

            const tx = await contract.setRiddle(riddle.question, answerHash);
            console.log(`Transaction sent: ${tx.hash}`);

            const receipt = await tx.wait();
            console.log(`Transaction confirmed in block ${receipt?.blockNumber}`);

            // Double check if the riddle was set correctly
            const storedRiddle = await contract.riddle();
            console.log(`Stored riddle: "${storedRiddle}"`);

            if (storedRiddle !== riddle.question) {
                console.warn(`Warning: The stored riddle "${storedRiddle}" does not match the generated riddle "${riddle.question}"`);
            }
        } catch (error) {
            console.error('Error setting riddle:', error);

            // Provide more specific error handling
            if (error instanceof Error) {
                if (error.message.includes("Riddle already active")) {
                    console.error("Cannot set a new riddle - there's already an active riddle");
                }

                if (error.message.includes("Only bot can call this function")) {
                    console.error("The wallet used does not have permission to set riddles");
                }
            }

            throw error;
        }
    }
}
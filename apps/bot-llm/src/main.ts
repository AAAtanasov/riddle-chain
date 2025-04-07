import { LLMService } from "./llm-service.interface";
import { OpenAiService } from "./openai-llm/openai.service";
import path from "path";
import { config } from "dotenv";
import { startListeners } from "./bot-server";

// TODO: load based on environment
config({ path: path.resolve(__dirname, '../.env.local') });


async function main() {

    const { CONTRACT_ADDRESS, INFURA_API_KEY, OPENAI_API_KEY } = process.env;

    console.log("Environment variables loaded:", {
        CONTRACT_ADDRESS,
        INFURA_API_KEY,
        OPENAI_API_KEY,
    });

    if (!CONTRACT_ADDRESS || !INFURA_API_KEY || !OPENAI_API_KEY) {
        throw new Error("Missing required environment variables");
    }
    console.log("Starting bot-llm...");

    await startListeners(INFURA_API_KEY, CONTRACT_ADDRESS, "");


    // listen for blockchain changes and invoke riddle change then
}

try {
    main();
} catch (error) {
    // TODO: handle with winston, make sure that the process doesn't die on error and keeps running
    console.error("Error in bot-llm:", error);
}

async function testLlmService() {
    console.log("Starting bot-llm...");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("API key is not defined");
    }

    const llmService: LLMService = new OpenAiService(apiKey);

    const riddle = await llmService.getRiddle();
    console.log("Generated riddle:", riddle);
}

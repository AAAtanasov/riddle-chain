import { ethers } from "ethers";
import { OnchainRiddle, OnchainRiddle__factory as riddleFactory } from "./lib/typechain-types";
import { config } from "dotenv";
import path from "path";
import { withRetry } from "./helpers";
import { RiddleService } from "./riddle/riddle.service";

config({ path: path.resolve(__dirname, '../.env.local') });


// const urlToConnect = "wss://sepolia.infura.io/ws/v3";
// const urlToConnect = "https://sepolia.infura.io/v3";

/**
 *  Starts a simple listening process for the riddle contract.
 * @param infuraKey Key to RPC node.
 * @param contractAddress Adress of contract for which we want to listen to.
 * @param privateKey The deployer key used to set the new riddle.
 */
export async function startListeners(): Promise<void> {
    try {
        const { CONTRACT_ADDRESS, INFURA_API_KEY, OPENAI_API_KEY, DEPLOYER_PRIVATE_KEY } = process.env;
        if (!CONTRACT_ADDRESS || !INFURA_API_KEY || !OPENAI_API_KEY || !DEPLOYER_PRIVATE_KEY) {
            throw new Error("Missing required environment variables");
        }
        // const provider = new ethers.JsonRpcProvider(`${urlToConnect}/${infuraKey}`);
        // const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545/');
        const provider = new ethers.WebSocketProvider('http://127.0.0.1:8545/');
        console.log("Connected to provider");

        const riddleContract: OnchainRiddle = riddleFactory.connect(CONTRACT_ADDRESS, provider);
        console.log("Listening to contract events...");

        const winnerEvent = riddleContract.getEvent('Winner');

        riddleContract.on(winnerEvent, (winnerAddress: string, event: any) => {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] Someone sollved the current riddle! Winner: ${winnerAddress}. Fetching a new one...`);

            // generate contract with signer credentials 
            const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);
            const signerContract = riddleFactory.connect(CONTRACT_ADDRESS, wallet);

            withRetry(() => RiddleService.setNewRiddle(OPENAI_API_KEY, signerContract));
        });

        console.log('Event listeners initialized. Waiting for events...');

        process.stdin.resume();

        process.on('SIGINT', () => {
            console.log('Shutting down event listener...');
            // Unsubscribe from all events
            riddleContract.removeAllListeners();
            process.exit(0);
        });


    } catch (error) {
        console.error('Error in event listener:', error);
        // TODO: send notification that server is down or restart...
        process.exit(1);
    }
}
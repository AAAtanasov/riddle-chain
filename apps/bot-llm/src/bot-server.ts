import { ethers, WebSocketProvider } from "ethers";
import { OnchainRiddle, OnchainRiddle__factory as riddleFactory } from "./lib/typechain-types";
import { config } from "dotenv";
import path from "path";
import { withRetry } from "./helpers";
import { RiddleService } from "./riddle/riddle.service";

config({ path: path.resolve(__dirname, '../.env.local') });


const SEPOLIA_ENDPOINT = 'wss://sepolia.infura.io/ws/v3';
const HARDHAT_ENDPOINT = 'http://127.0.0.1:8545/';
// const urlToConnect = "https://sepolia.infura.io/v3";

/**
 *  Starts a simple listening process for the riddle contract.
 * @param infuraKey Key to RPC node.
 * @param contractAddress Adress of contract for which we want to listen to.
 * @param privateKey The deployer key used to set the new riddle.
 */
export async function startListeners(): Promise<void> {
    try {
        const { CONTRACT_ADDRESS, INFURA_API_KEY, OPENAI_API_KEY, DEPLOYER_PRIVATE_KEY, IS_HARDHAT } = process.env;
        if (!CONTRACT_ADDRESS || !OPENAI_API_KEY || !DEPLOYER_PRIVATE_KEY) {
            throw new Error("Missing required environment variables");
        }

        if (IS_HARDHAT && !INFURA_API_KEY) {
            throw new Error("Missing INFURA_API_KEY environment variable for sepolia endpoint");
        } 

        const urlToConnect = IS_HARDHAT ? HARDHAT_ENDPOINT : `${SEPOLIA_ENDPOINT}/${INFURA_API_KEY}`;
        const provider = new ethers.WebSocketProvider(urlToConnect);
        console.log("Connected to provider");

        const riddleContract: OnchainRiddle = riddleFactory.connect(CONTRACT_ADDRESS, provider);
        console.log("Listening to contract events...");

        const winnerEvent = riddleContract.getEvent('Winner');

        riddleContract.on(winnerEvent, (winnerAddress: string, event: any) => {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] Someone sollved the current riddle! Winner: ${winnerAddress}. Fetching a new one...`);

            // generate contract with signer credentials 
            // const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);
            // const signerContract = riddleFactory.connect(CONTRACT_ADDRESS, wallet);

            // withRetry(() => RiddleService.setNewRiddle(OPENAI_API_KEY, signerContract));
            setRiddleInContract(DEPLOYER_PRIVATE_KEY, provider, CONTRACT_ADDRESS, OPENAI_API_KEY);
        });

        console.log('Event listeners initialized. Waiting for events...');

        // check if riddle is solved on start and not updated yet
        const isRiddleSet = await riddleContract.isActive();
        if (!isRiddleSet) {
            console.log("Riddle is not set. Setting a new one...");
            setRiddleInContract(DEPLOYER_PRIVATE_KEY, provider, CONTRACT_ADDRESS, OPENAI_API_KEY);
        }

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

async function setRiddleInContract(
    deployerKey: string,
    provider: WebSocketProvider,
    contractAddress: string,
    aiKey: string):
    Promise<void> {
    const wallet = new ethers.Wallet(deployerKey, provider);
    const signerContract = riddleFactory.connect(contractAddress, wallet);

    withRetry(() => RiddleService.setNewRiddle(aiKey, signerContract));
}
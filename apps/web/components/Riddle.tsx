'use server';

import { BrowserProvider } from "ethers";

import { OnchainRiddle__factory as riddleFactory } from "../lib/typechain-types/factories"
import { OnchainRiddle } from "../lib/typechain-types";

// TODO: use after refactor sever/client components
import { config } from "dotenv";
import { GuessModel } from "../lib/guess/guess.model";
import { RiddleContents } from "./RiddleContents";
import { addGuess } from "../lib/guess/guess.service";


// Potential fix for type of ethereum
declare global {
    interface Window {
        ethereum?: any;
    }
}

// TODO: secure and listen to accountsChanged event. WARNING TO ME - changing accounts may not get the correct account, need to verify and test

// TODO: env variable.
// TODO: bug present when swiching networks, need to handle error fetching riddle
// Localhost
const RIDDLE_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
// Sepolia
// const RIDDLE_CONTRACT_ADDRESS = '0x6d6DDe9c7C11bF4e0b495Ea17DF05d86e472C8a4';

// TODO: consider types for the react component
export default async function Riddle({ guessRiddleCallback }: { guessRiddleCallback: (guess: GuessModel) => void }) {
    // const [riddle, setRiddle] = useState<string>('');
    // const [account, setAccount] = useState(null);
    // const [isActive, setIsActive] = useState(false);
    // const [answer, setAnswer] = useState<string>('');
    // const [username, setUsername] = useState<string>('');
    // let contract: OnchainRiddle;
    let browserProvider: BrowserProvider;
    // const [provider, setProvider] = useState(null);
    // const [signer, setSigner] = useState(null);
    let riddle: string = '';
    let account: string | null = null;
    let isActive: boolean;

    // async function fetchRiddle(): Promise<void> {
    //     if (isWindowEthereumDefined()) {
    //         requestAccount();
    //         const browserProvider = fetchBrowserProvider();
    //         // TODO: define contract type from typechain
    //         const contract = riddleFactory.connect(RIDDLE_CONTRACT_ADDRESS, browserProvider);

    //         try {
    //             const data = await contract.riddle();
    //             console.log("Riddle data:", data);
    //             riddle = data;

    //             isActive = await contract.isActive();
    //         } catch (error) {
    //             console.error("Error fetching riddle:", error);

    //         }
    //     }
    // }

    // await fetchRiddle();


    function fetchBrowserProvider(): BrowserProvider {
        if (!browserProvider && isWindowEthereumDefined()) {
            browserProvider = new BrowserProvider(window.ethereum);

            // const signer = browserProvider.getSigner();

            return browserProvider;
        }

        return browserProvider;
    }

    function isWindowEthereumDefined(): boolean {
        const isDefined = typeof window.ethereum !== 'undefined';

        if (!isDefined) {
            throw new Error("Ethereum object not found");
        }

        return isDefined;
    }

    async function requestAccount(): Promise<void> {
        if (isWindowEthereumDefined()) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' }, []);

            } catch (error) {
                console.error("Error requesting account:", error);
                throw error;
            }
        }
    }

    async function storeShit(guess: GuessModel): Promise<void> {
        'use server';
        await addGuess(guess);
    }



    async function guessRiddle(guess: GuessModel, contract: OnchainRiddle): Promise<void> {
        'use server';
        if (!guess) {
            console.error("Guess is null or undefined");
            return;
        }
        // const isActive = await contract.isActive();

        // if (!isActive || !guess.answer || guess.answer.trim() === '') {
        //     console.error(`Riddle is not active or answer is empty, isActive: ${isActive}, answer: ${guess.answer}`);
        //     return;
        // }

        console.log("Guessing riddle with answer:", guess.answer);

        // requestAccount();

        // const browserProvider = fetchBrowserProvider();
        // const signer = await browserProvider.getSigner();
        // console.log("Signer: ", signer);

        // const contract: OnchainRiddle = riddleFactory.connect(RIDDLE_CONTRACT_ADDRESS, signer);
        const answerEvent = contract.getEvent('AnswerAttempt');

        try {
            // todo: on RiddleSet reload
            contract.on(answerEvent, (user: string, correct: boolean, event: any) => {
                console.log('AnswerAttempt event:', user, correct);
                if (user === guess.wallet) {
                    console.log('You guessed the riddle!');
                    if (correct) {
                        console.log('Correct answer!');
                    } else {
                        console.log('Incorrect answer.');
                    }
                    // store guess here 

                    // stop listening for my event 
                    contract.off(answerEvent);
                }
            });

            // Making sure to trim the answer and convert it to lowercase for our ease of use
            const trimmedAnswer = guess.answer.trim().toLowerCase();
            const data = await contract.submitAnswer(trimmedAnswer);
            console.log('data: ', data);
            await data.wait();

            // Resetting answer if all was succesful
            // setAnswer('');
        } catch (error) {
            console.error("Error guessing riddle:", error);

        }
    }

    // TODO: add suspence to loading while waiting for check for transaction
    return (
        <RiddleContents riddle={riddle} guessRiddleCallback={storeShit} />
    )

}
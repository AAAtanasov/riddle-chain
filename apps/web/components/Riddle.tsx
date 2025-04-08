'use server';

// TODO: use after refactor sever/client components
import { GuessModel } from "../lib/guess/guess.model";
import { RiddleContents } from "./RiddleContents";
import { addGuess } from "../lib/guess/guess.service";

import { config } from "dotenv";
config({ path: '../../.env.local' });


export default async function Riddle() {
    // TODO: fix turbo configuration
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    const { CONTRACT_ADDRESS } = process.env;
    if (!CONTRACT_ADDRESS) {
        throw new Error("Missing CONTRACT_ADDRESS environment variable");
    }

    async function storeGuess(guess: GuessModel): Promise<void> {
        'use server';
        await addGuess(guess);
    }

    // TODO: add suspence to loading while waiting for check for transaction
    return (
        <div >
            <RiddleContents contractAddress={CONTRACT_ADDRESS || ''} guessRiddleCallback={storeGuess} />
            {/* can add right component */}
        </div>
    )

}
'use server';

// TODO: use after refactor sever/client components
import { GuessModel } from "../lib/guess/guess.model";
import { RiddleContents } from "./RiddleContents";
import { addGuess } from "../lib/guess/guess.service";

import { config } from "dotenv";
import { Suspense } from "react";
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

    return (
        <div className="flex flex-col m-6 space-y-10 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0 md:m-0">
            <div className="p-20 md:p-20">
                <h2 className="mb-2 text-3xl font-bold text-center">Guess a riddle!</h2>
                <p className="max-w-sm text-gray-500 text-center ">
                    Can you guess the answer? Connect your wallet and enter your name to give it a try!
                </p>
                <Suspense fallback={<div className="text-center">Loading riddle...</div>}>
                    <RiddleContents contractAddress={CONTRACT_ADDRESS || ''} guessRiddleCallback={storeGuess} />

                </Suspense>
            </div>
        </div>
    )

}
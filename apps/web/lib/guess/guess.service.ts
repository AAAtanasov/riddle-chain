import prisma from "../prisma";
import { GuessModel } from "./guess.model";

export async function addGuess(guessDto: GuessModel): Promise<GuessModel> {
    try {
        const guess = await prisma.guess.create({
            data: {
                username: guessDto.username,
                wallet: guessDto.wallet,
                answer: guessDto.answer,
                isCorrect: guessDto.isCorrect
            }
        });

        return guess;
    } catch (error) {
        console.error("Error in addGuess:", error);
        throw error;
    }

}
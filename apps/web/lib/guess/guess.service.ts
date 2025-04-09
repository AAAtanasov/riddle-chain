import prisma from "../prisma";
import { GuessModel } from "./guess.model";

/**
 * Stores a guess into the postgress db 
 * @param guessDto DTO for the guess
 * @returns 
 */
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

/**
 * Retrieves all guesses from the postggress database
 * @returns List of all guesses in the database
 */
export async function getGuesses(): Promise<GuessModel[]> {
    try {
        const guesses = await prisma.guess.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });

        return guesses;
    } catch (error) {
        console.error("Error in getGuesses:", error);
        throw error;
    }
}
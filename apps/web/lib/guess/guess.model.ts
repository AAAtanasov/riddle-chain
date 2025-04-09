
/**
 * @description
 * This file contains the model for the guess table in the database. The wallet is mandatory while the username may be null.
 */
export type GuessModel = {
    id: string,
    username: string | null,
    wallet: string,
    answer: string,
    isCorrect: boolean,
    createdAt: Date,
    updatedAt: Date,
}
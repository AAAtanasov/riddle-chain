import { FC } from "react";
import { GuessModel } from "../lib/guess/guess.model";
import { GuessTable } from "./GuessTable";

interface HistoryContainerProps {
    guesses: GuessModel[];
}

export function HistoryContainer({ guesses }: HistoryContainerProps) {
    return (
        <div className="flex">
            {guesses.length > 0 ? (
                <GuessTable guesses={guesses} />
            ) : (
                <p>No guesses yet!</p>
            )}
        </div>
    );



}
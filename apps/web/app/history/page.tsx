import Link from "next/link";
import { Suspense } from "react";
import { HistoryContainer } from "../../components/HistoryContainer";
import { getGuesses } from "../../lib/guess/guess.service";

export default async function HistoryPage() {
    const guesses = await getGuesses();

    return (
        <main>
            <div className="flex flex-col m-6 space-y-10 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0 md:m-0">
                {/* <h1 className="text-3xl font-bold">History</h1>
                <div className="flex flex-col items-center justify-center w-full max-w-2xl p-6 bg-white border border-gray-200 rounded-lg shadow-md">
                    <p className="text-lg text-gray-700">No riddles yet!</p>
                </div>
                 */}
                <div className="p-20 md:p-20">
                    <h2 className="mb-2 text-3xl font-bold text-center">Previous attempts</h2>
                    <div className="flex">
                        <Suspense fallback={<div className="text-center">Loading history...</div>}>
                            <HistoryContainer guesses={guesses} />
                        </Suspense>
                    </div>
                    <div className="flex items-center justify-center">
                        <Link href="/" className="mt-6 text-blue-500 hover:underline">
                            Go back to Home
                        </Link>
                    </div>

                </div>
            </div>

        </main>
    );
}
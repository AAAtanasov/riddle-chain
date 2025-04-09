import { GuessModel } from "../lib/guess/guess.model";
import { format } from 'date-fns';

export function GuessTable({ guesses }: { guesses: GuessModel[] }) {
    const formatWalletAddress = (wallet: string): string => {
        if (wallet.length > 10) {
            return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
        }
        return wallet;
    };

    // Format date for display
    const formatDate = (date: Date): string => {
        return format(new Date(date), 'MMM d, yyyy h:mm a');
    };

    return (
        <div className="flex w-full max-h-96 overflow-y-auto">
            <table>
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Username
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Wallet
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Answer
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Result
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {guesses.map((guess) => (
                        <tr key={guess.id} className={guess.isCorrect ? "bg-green-50" : ""}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {guess.username || 'Anonymous'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatWalletAddress(guess.wallet)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {guess.answer}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${guess.isCorrect
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {guess.isCorrect ? 'Correct' : 'Incorrect'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(guess.createdAt)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )


}
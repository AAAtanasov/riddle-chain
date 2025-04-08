import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-bold text-gray-800">404 - Not Found</h1>
            <p className="mt-4 text-lg text-gray-600">
                The page you are looking for does not exist.
            </p>
            <Link href="/" className="mt-6 text-blue-500 hover:underline">
                Go back to Home
            </Link>
        </div>
    );
}
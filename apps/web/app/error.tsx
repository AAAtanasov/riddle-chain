'use client';

export default function ErrorPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
            <p className="text-lg">Please try again later.</p>
        </div>
    );
}
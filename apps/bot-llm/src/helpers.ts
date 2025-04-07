

interface RetryOptions {
    maxRetries: number,
    delay: number,
    onRetry: Function
}

/**
 * Executes a function with retry capabilities. The function will be retried with an increased delay between each attempts.
 * This means that if the we have a delay of 1000ms, the first retry will be after 1000ms, the second after 2000ms, etc.
 * @param {Function} fn - The async function to execute
 * @param {Object} options - Retry configuration options
 * @param {number} options.maxRetries - Maximum number of retry attempts
 * @param {number} options.delay - Delay between retries in milliseconds
 * @param {Function} options.onRetry - Callback function called on each retry with attempt number and error
 * @returns {Promise} - Resolves with the function result or rejects after all retries fail
 */
export async function withRetry(fn: Function, options?: RetryOptions) {
    const maxRetries = options?.maxRetries || 3;
    const delay = options?.delay || 1000;
    const onRetry = options?.onRetry || ((attempt: number, error: Error) => console.log(`Attempt ${attempt} failed: ${error.message}. Retrying...`));

    let lastError: Error = new Error();

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt <= maxRetries) {
                // Call the onRetry callback with attempt number and error
                onRetry(attempt, error);

                // Wait for the specified delay, delaying incrementaly 
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
            }
        }
    }

    // Executes should all attempts fail.
    throw new Error(`All ${maxRetries + 1} attempts failed. Last error: ${lastError.message}`);
}
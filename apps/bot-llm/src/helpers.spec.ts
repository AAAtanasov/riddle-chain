import { withRetry } from './helpers'; // Update with the correct import path

// Helper to mock timing functions
jest.useFakeTimers();

describe('withRetry function', () => {
    beforeEach(() => {
        jest.setTimeout(60000);
    });
    // Test for successful execution on first attempt
    test('should resolve immediately when function succeeds on first attempt', async () => {
        const mockFn = jest.fn().mockResolvedValue('success');
        const onRetry = jest.fn();

        const promise = withRetry(mockFn, { maxRetries: 3, delay: 1000, onRetry });

        await expect(promise).resolves.toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(onRetry).not.toHaveBeenCalled();
    });

    // Test for successful execution after a few retries
    test('should retry and eventually succeed', async () => {
        // Mock function that fails twice then succeeds
        const mockFn = jest.fn()
            .mockRejectedValueOnce(new Error('Fail 1'))
            .mockRejectedValueOnce(new Error('Fail 2'))
            .mockResolvedValue('success');

        const onRetry = jest.fn();

        const promise = withRetry(mockFn, { maxRetries: 3, delay: 100, onRetry });

        // Fast-forward through delays
        jest.runAllTimersAsync();

        const result = await promise;

        await expect(promise).resolves.toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(3);
        expect(onRetry).toHaveBeenCalledTimes(2);
        expect(onRetry).toHaveBeenNthCalledWith(1, 1, expect.any(Error));
        expect(onRetry).toHaveBeenNthCalledWith(2, 2, expect.any(Error));
    }, 5000);

    // Test for failure after all retries
    test('should fail after exhausting all retry attempts', async () => {
        const error = new Error('Always fails');
        const mockFn = jest.fn().mockRejectedValue(error);
        const onRetry = jest.fn();

        const promise = withRetry(mockFn, { maxRetries: 2, delay: 1000, onRetry });

        // Fast-forward through delays
        jest.runAllTimersAsync();

        await expect(promise).rejects.toThrow('All 3 attempts failed');
        expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
        expect(onRetry).toHaveBeenCalledTimes(2);
    });

    // Test for default options
    test('should use default options when not provided', async () => {
        const mockFn = jest.fn()
            .mockRejectedValueOnce(new Error('Fail 1'))
            .mockRejectedValueOnce(new Error('Fail 2'))
            .mockRejectedValueOnce(new Error('Fail 3'))
            .mockResolvedValue('success');

        // Mock console.log to verify default onRetry behavior
        const originalConsoleLog = console.log;
        console.log = jest.fn();

        const promise = withRetry(mockFn);

        // Fast-forward through delays
        jest.runAllTimersAsync();

        await expect(promise).resolves.toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(4); // Initial + 3 retries (default)
        expect(console.log).toHaveBeenCalledTimes(3);

        // Restore console.log
        console.log = originalConsoleLog;
    });
});
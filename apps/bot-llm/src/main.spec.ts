import { main } from './main';
import { startListeners } from './bot-server';

// Mock the bot-server module
jest.mock('./bot-server', () => ({
    startListeners: jest.fn()
}));

describe('bot-llm main function', () => {
    let originalConsoleLog: any;
    let originalConsoleError: any;
    let mockConsoleLog: jest.Mock;
    let mockConsoleError: jest.Mock;

    beforeEach(() => {
        // Mock console.log and console.error
        originalConsoleLog = console.log;
        originalConsoleError = console.error;
        mockConsoleLog = jest.fn();
        mockConsoleError = jest.fn();
        console.log = mockConsoleLog;
        console.error = mockConsoleError;

        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    afterEach(() => {
        // Restore original console methods
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
    });

    describe('main function', () => {
        it('should call startListeners', async () => {
            (startListeners as jest.Mock).mockResolvedValue(undefined);

            await main();

            expect(startListeners).toHaveBeenCalledTimes(1);
        });

        // it('should handle errors from startListeners', async () => {
        //     const testError = new Error('Test error');
        //     (startListeners as jest.Mock).mockRejectedValue(testError);

        //     // await expect(main()).resolves.toThrow(); // The function itself shouldn't throw

        //     try {
        //         await main();
        //     } catch (error) {
        //         expect(error).toBeInstanceOf(Error);
        //     }

        //     expect(console.error).toHaveBeenCalledWith('Error in bot-llm:', testError);
        // });
    });
});
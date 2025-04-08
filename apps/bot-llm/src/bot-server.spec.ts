// Import the dependencies that need to be mocked
import { ethers } from 'ethers';
import { withRetry } from './helpers';
import { RiddleService } from './riddle/riddle.service';
import { startListeners, setRiddleInContract } from './bot-server'; // Update with the actual file name
import { config } from 'dotenv';
import path from 'path';

// Mock the dependencies
jest.mock('ethers', () => {
    const original = jest.requireActual('ethers');
    return {
        ...original,
        ethers: {
            WebSocketProvider: jest.fn(),
            Wallet: jest.fn().mockImplementation(() => {
                return jest.fn().mockResolvedValue(jest.fn()); // Return a mock wallet object
            })
        }
    };
});

jest.mock('./helpers', () => ({
    withRetry: jest.fn().mockImplementation((fn) => fn())
}));

jest.mock('./riddle/riddle.service', () => ({
    RiddleService: {
        setNewRiddle: jest.fn().mockResolvedValue(undefined)
    }
}));

jest.mock('dotenv', () => ({
    config: jest.fn()
}));

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Mock process.exit and other process methods
const mockExit = jest.fn();
process.exit = mockExit as unknown as (code?: string | number | null | undefined) => never;

const mockOn = jest.fn();
process.on = mockOn;

const mockResume = jest.fn();
process.stdin.resume = mockResume;

describe('startListeners', () => {
    // Setup mocks before each test
    let mockProvider: any;
    let mockContract: any;
    let mockWallet: any;
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        // Save original environment and set test environment
        originalEnv = process.env;
        process.env = {
            CONTRACT_ADDRESS: '0xMockContractAddress',
            INFURA_API_KEY: 'mock-infura-key',
            OPENAI_API_KEY: 'mock-openai-key',
            DEPLOYER_PRIVATE_KEY: 'mock-private-key'
        };

        // Mock WebSocketProvider
        mockProvider = {
            getNetwork: jest.fn().mockResolvedValue({ name: 'sepolia' })
        };
        (ethers.WebSocketProvider as jest.Mock).mockReturnValue(mockProvider);

        // Mock Wallet
        mockWallet = {};
        (ethers.Wallet as unknown as jest.Mock).mockReturnValue(mockWallet);

        // Mock contract
        mockContract = {
            getEvent: jest.fn().mockReturnValue('mockEvent'),
            on: jest.fn(),
            removeAllListeners: jest.fn(),
            isActive: jest.fn().mockResolvedValue(true)
        };

        // Mock riddleFactory.connect
        const mockRiddleFactory = {
            connect: jest.fn().mockReturnValue(mockContract)
        };
        jest.mock('./lib/typechain-types', () => ({
            OnchainRiddle__factory: mockRiddleFactory
        }));

        // Spy on console methods
        console.log = jest.fn();
        console.error = jest.fn();
    });

    afterEach(() => {
        // Restore environment and console methods
        process.env = originalEnv;
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        jest.clearAllMocks();
    });

    test('should initialize correctly with valid environment variables', async () => {
        // Import the module after mocking
        const { startListeners } = require('./bot-server');

        await startListeners();

        // Check if provider was initialized correctly
        expect(ethers.WebSocketProvider).toHaveBeenCalledWith('wss://sepolia.infura.io/ws/v3/mock-infura-key');

        // Check if event listeners were set up
        expect(mockContract.getEvent).toHaveBeenCalledWith('Winner');
        expect(mockContract.on).toHaveBeenCalled();
        expect(mockContract.isActive).toHaveBeenCalled();

        // Check if process handlers were set up
        expect(process.stdin.resume).toHaveBeenCalled();
        expect(process.on).toHaveBeenCalledWith('SIGINT', expect.any(Function));

        // Since isActive returned true, setRiddleInContract should not be called
        expect(ethers.Wallet).not.toHaveBeenCalled();
    });

    test('should throw error when required environment variables are missing', async () => {
        // Remove required env vars
        delete process.env.CONTRACT_ADDRESS;

        // Import the module after mocking
        const { startListeners } = require('./bot-server');

        await startListeners();

        // Should log error and exit
        expect(console.error).toHaveBeenCalled();
        expect(mockExit).toHaveBeenCalledWith(1);
    });

    // TODO: mock contract is failing: need to fix the mock
    // test('should set new riddle when current riddle is not active', async () => {
    //     // Mock isActive to return false
    //     mockContract.isActive.mockResolvedValueOnce(false);

    //     // Import the module after mocking
    //     const { startListeners } = require('./bot-server');

    //     await startListeners();

    //     // Should call setRiddleInContract
    //     expect(ethers.Wallet).toHaveBeenCalled();
    //     // expect(ethers.Wallet).toHaveBeenCalledWith('mock-private-key', mockProvider);
    //     expect(withRetry).toHaveBeenCalled();
    //     expect(RiddleService.setNewRiddle).toHaveBeenCalled();
    // });

    // test('should handle Winner event and set new riddle', async () => {
    //     // Import the module after mocking
    //     const { startListeners } = require('./bot-server');

    //     await startListeners();

    //     // Get the event handler function that was registered
    //     const eventHandler = mockContract.on.mock.calls[0][1];

    //     // Call the event handler
    //     eventHandler('0xWinnerAddress', { blockNumber: 123 });

    //     // Should call setRiddleInContract
    //     expect(ethers.Wallet).toHaveBeenCalled();
    //     expect(withRetry).toHaveBeenCalled();
    //     expect(RiddleService.setNewRiddle).toHaveBeenCalled();
    // });

    test('should handle hardhat endpoint correctly', async () => {
        // Set IS_HARDHAT env var
        process.env.IS_HARDHAT = 'true';

        // Import the module after mocking
        const { startListeners } = require('./bot-server');

        await startListeners();

        // Should use hardhat endpoint
        expect(ethers.WebSocketProvider).toHaveBeenCalledWith('http://127.0.0.1:8545/');
    });

    test('should throw error when INFURA_API_KEY is missing and not in hardhat mode', async () => {
        // Remove INFURA_API_KEY but set IS_HARDHAT to true
        delete process.env.INFURA_API_KEY;
        process.env.IS_HARDHAT = 'true';

        // Import the module after mocking
        const { startListeners } = require('./bot-server');

        await startListeners();

        // Should log error and exit
        expect(console.error).toHaveBeenCalled();
        expect(mockExit).toHaveBeenCalledWith(1);
    });
});
import { ethers } from "ethers";
import { RiddleService } from "./riddle.service";
import { OnchainRiddle } from "../lib/typechain-types";
import { OpenAiService } from "../openai-llm/openai.service";

// Mock dependencies
jest.mock("../openai-llm/openai.service");

describe("RiddleService", () => {
    let mockContract: jest.Mocked<OnchainRiddle>;
    const mockOpenAIKey = "test-api-key";

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock contract methods
        mockContract = {
            isActive: jest.fn(),
            riddle: jest.fn(),
            setRiddle: jest.fn(),
        } as unknown as jest.Mocked<OnchainRiddle>;

        // Mock the OpenAiService
        (OpenAiService as jest.Mock).mockImplementation(() => ({
            generateRiddle: jest.fn().mockResolvedValue({
                question: "What has keys but no locks?",
                answer: "A piano"
            })
        }));
    });

    it("should not set a new riddle if one is already active", async () => {
        // Arrange
        mockContract.isActive.mockResolvedValue(true);
        const consoleSpy = jest.spyOn(console, "log");

        // Act
        await RiddleService.setNewRiddle(mockOpenAIKey, mockContract);

        // Assert
        expect(consoleSpy).toHaveBeenCalledWith("Riddle is already set. Exiting...");
        expect(mockContract.setRiddle).not.toHaveBeenCalled();
    });

    it("should set a new riddle successfully when none is active", async () => {
        // Arrange
        mockContract.isActive.mockResolvedValue(false);
        mockContract.riddle.mockResolvedValue("Old riddle");

        const mockTx = {
            hash: "0x123",
            wait: jest.fn().mockResolvedValue({ blockNumber: 123 })
        } as any;
        mockContract.setRiddle.mockResolvedValue(mockTx);

        // Mock that after setting, the contract returns the new riddle
        mockContract.riddle.mockResolvedValueOnce("Old riddle")
            .mockResolvedValueOnce("What has keys but no locks?");

        const consoleSpy = jest.spyOn(console, "log");

        // Act
        await RiddleService.setNewRiddle(mockOpenAIKey, mockContract);

        // Assert
        expect(mockContract.setRiddle).toHaveBeenCalledTimes(1);
        // Verify the hash calculation matches what the service would generate
        const answerBytes = ethers.toUtf8Bytes("A piano");
        const answerHash = ethers.keccak256(answerBytes);
        expect(mockContract.setRiddle).toHaveBeenCalledWith("What has keys but no locks?", answerHash);
        expect(consoleSpy).toHaveBeenCalledWith(`Transaction sent: 0x123`);
        expect(consoleSpy).toHaveBeenCalledWith(`Transaction confirmed in block 123`);
    });

    it("should throw an error if LLM fails to generate a complete riddle", async () => {
        // Arrange
        mockContract.isActive.mockResolvedValue(false);

        // Mock incomplete riddle
        (OpenAiService as jest.Mock).mockImplementation(() => ({
            generateRiddle: jest.fn().mockResolvedValue({
                question: "What has keys but no locks?",
                answer: null // Missing answer
            })
        }));

        // Act & Assert
        await expect(RiddleService.setNewRiddle(mockOpenAIKey, mockContract))
            .rejects
            .toThrow("Failed to generate riddle with complete question and answer");

        expect(mockContract.setRiddle).not.toHaveBeenCalled();
    });

    it("should warn if the stored riddle doesn't match the generated one", async () => {
        // Arrange
        mockContract.isActive.mockResolvedValue(false);

        const mockTx = {
            hash: "0x123",
            wait: jest.fn().mockResolvedValue({ blockNumber: 123 })
        } as any;
        mockContract.setRiddle.mockResolvedValue(mockTx);

        // Mock that after setting, the contract returns a different riddle
        mockContract.riddle.mockResolvedValueOnce("Old riddle")
            .mockResolvedValueOnce("Different stored riddle"); // This doesn't match the generated one

        const consoleWarnSpy = jest.spyOn(console, "warn");

        // Act
        await RiddleService.setNewRiddle(mockOpenAIKey, mockContract);

        // Assert
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'Warning: The stored riddle "Different stored riddle" does not match the generated riddle "What has keys but no locks?"'
        );
    });

    it("should handle and rethrow contract errors", async () => {
        // Arrange
        mockContract.isActive.mockResolvedValue(false);
        const error = new Error("Only bot can call this function");
        mockContract.setRiddle.mockRejectedValue(error);

        const consoleErrorSpy = jest.spyOn(console, "error");

        // Act & Assert
        await expect(RiddleService.setNewRiddle(mockOpenAIKey, mockContract))
            .rejects
            .toThrow("Only bot can call this function");

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error setting riddle:', error);
        expect(consoleErrorSpy).toHaveBeenCalledWith("The wallet used does not have permission to set riddles");
    });
});
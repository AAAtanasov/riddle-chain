import { OpenAiService } from './openai.service';
import { ChatOpenAI } from "@langchain/openai";

// Mock the ChatOpenAI class
jest.mock("@langchain/openai", () => {
  return {
    ChatOpenAI: jest.fn().mockImplementation(() => {
      return {
        invoke: jest.fn()
      };
    })
  };
});

describe('OpenAiService', () => {
  let openAiService: OpenAiService;
  const mockApiKey = 'test-api-key';
  
  beforeEach(() => {
    jest.clearAllMocks();
    openAiService = new OpenAiService(mockApiKey);
  });

  it('should initialize with the correct parameters', () => {
    expect(ChatOpenAI).toHaveBeenCalledWith({
      model: "gpt-4o-mini",
      temperature: 1,
      openAIApiKey: mockApiKey
    });
  });

  describe('generateRiddle', () => {
    it('should throw an error if oldRiddle is empty', async () => {
      await expect(openAiService.generateRiddle('')).rejects.toThrow('Old riddle is required.');
    });

    it('should successfully generate and parse a riddle', async () => {
      const mockOldRiddle = 'What has keys but no locks?';
      const mockResponseContent = '{"question": "I speak without a mouth and hear without ears. What am I?", "answer": "Echo"}';
      
      // Mock the invoke method to return a successful response
      const mockInvoke = jest.fn().mockResolvedValue({
        content: mockResponseContent
      });
      
      (openAiService as any).model.invoke = mockInvoke;

      const result = await openAiService.generateRiddle(mockOldRiddle);
      
      // Check that invoke was called with the correct prompt
      expect(mockInvoke).toHaveBeenCalled();
      
      // Check that the result is properly parsed
      expect(result).toEqual({
        question: 'I speak without a mouth and hear without ears. What am I?',
        answer: 'echo'  // Lowercase as per the implementation
      });
    });

    it('should throw an error when no response is received', async () => {
      const mockOldRiddle = 'What has keys but no locks?';
      
      // Mock to return an empty response
      const mockInvoke = jest.fn().mockResolvedValue({
        content: null
      });
      
      (openAiService as any).model.invoke = mockInvoke;

      await expect(openAiService.generateRiddle(mockOldRiddle)).rejects.toThrow('No response from OpenAI');
    });

    it('should throw an error when response format is invalid', async () => {
      const mockOldRiddle = 'What has keys but no locks?';
      const mockResponseContent = 'This is not a valid JSON response';
      
      const mockInvoke = jest.fn().mockResolvedValue({
        content: mockResponseContent
      });
      
      (openAiService as any).model.invoke = mockInvoke;

      await expect(openAiService.generateRiddle(mockOldRiddle)).rejects.toThrow('Invalid response format');
    });

    it('should throw an error when JSON parsing fails', async () => {
      const mockOldRiddle = 'What has keys but no locks?';
      const mockResponseContent = '{"question": "Invalid JSON missing closing bracket"';
      
      const mockInvoke = jest.fn().mockResolvedValue({
        content: mockResponseContent
      });
      
      (openAiService as any).model.invoke = mockInvoke;

      await expect(openAiService.generateRiddle(mockOldRiddle)).rejects.toThrow('Invalid response format');
    });
  });
});
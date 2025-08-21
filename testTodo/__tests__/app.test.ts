import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

// Import the actual GoogleGenerativeAI to mock it
import { GoogleGenerativeAI } from '@google/generative-ai';

// Import the main function from src/index.ts
import { main } from '../src/index';

const execPromise = promisify(exec);

const appPath = path.resolve(__dirname, '../src/index.ts');

// Mock the entire @google/generative-ai module
vi.mock('@google/generative-ai', () => {
  const mockGenerativeModel = {
    generateContent: vi.fn(async (question: string) => {
      // Simulate a response from Gemini, WITHOUT the "AIからの回答：" prefix
      return {
        response: {
          text: () => `モックされた回答 for "${question}"`, // Removed "AIからの回答："
        },
      };
    }),
  };

  const mockGoogleGenerativeAI = vi.fn(() => ({
    getGenerativeModel: vi.fn(() => mockGenerativeModel),
  }));

  return { GoogleGenerativeAI: mockGoogleGenerativeAI };
});


describe('CLI Application Tests', () => {
  beforeEach(() => {
    const srcDir = path.dirname(appPath);
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir);
    }
    if (!fs.existsSync(appPath)) {
      fs.writeFileSync(appPath, '// Placeholder for src/index.ts\n');
    }
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  // Define common exec options to pass environment variables
  const commonExecOptions = {
    env: {
      ...process.env, // Inherit existing environment variables
      GEMINI_API_KEY: 'mock_api_key', // Explicitly set for the child process
    },
  };

  it('should display help message when --help is used', async () => {
    const { stdout } = await execPromise(`npx tsx ${appPath} --help`, commonExecOptions);
    expect(stdout).toContain('Usage:');
    expect(stdout).toContain('Options:');
    expect(stdout).toContain('痛みに関する質問をする');
  }, 10000);

  it('should display version when --version is used', async () => {
    const packageJsonPath = path.resolve(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const expectedVersion = packageJson.version || '0.0.0';

    const { stdout } = await execPromise(`npx tsx ${appPath} --version`, commonExecOptions);
    expect(stdout).toContain(expectedVersion);
  }, 10000);

  it('should display a disclaimer when running the app', async () => {
    const { stdout } = await execPromise(`npx tsx ${appPath} "テスト質問"`, commonExecOptions);
    expect(stdout).toContain('【免責事項】');
    expect(stdout).toContain('医療専門家による診断、治療、または助言に代わるものではありません');
  }, 10000);

  it('should send question to Gemini API and display response', async () => {
    const question = "膝が痛いのですが、どうすればいいですか？";

    // Mock console.log and process.exit
    const consoleSpy = vi.spyOn(console, 'log');
    const consoleErrorSpy = vi.spyOn(console, 'error');
    const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { /* do nothing */ });

    // Set the mock API key for the test
    process.env.GEMINI_API_KEY = 'mock_api_key';

    // Directly call the main function
    await main([question]);

    // Check if GoogleGenerativeAI was instantiated
    expect(GoogleGenerativeAI).toHaveBeenCalledWith(process.env.GEMINI_API_KEY);

    // Check if getGenerativeModel was called
    const mockGenAIInstance = (GoogleGenerativeAI as vi.Mock).mock.results[0].value;
    expect(mockGenAIInstance.getGenerativeModel).toHaveBeenCalledWith({ model: "gemini-pro" });

    // Check if generateContent was called with the correct question
    const mockModelInstance = mockGenAIInstance.getGenerativeModel.mock.results[0].value;
    expect(mockModelInstance.generateContent).toHaveBeenCalledWith(question);

    // Check the output
    expect(consoleSpy).toHaveBeenCalledWith(`AIからの回答：モックされた回答 for "${question}"`);

    // Restore mocks
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  }, 15000);
});

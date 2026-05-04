import { BadRequestException } from '@nestjs/common';
import { Provider } from '@prisma/client';
import { LlmProvidersService } from './llm-providers.service';

describe('LlmProvidersService', () => {
  let llmProvidersService: LlmProvidersService;

  let openaiServiceMock: {
    generateText: jest.Mock;
    streamText: jest.Mock;
  };

  let googleServiceMock: {
    generateText: jest.Mock;
    streamText: jest.Mock;
  };

  let prismaMock: {
    apiKey: {
      findFirst: jest.Mock;
    };
  };

  beforeEach(() => {
    openaiServiceMock = {
      generateText: jest.fn(),
      streamText: jest.fn(),
    };

    googleServiceMock = {
      generateText: jest.fn(),
      streamText: jest.fn(),
    };

    prismaMock = {
      apiKey: {
        findFirst: jest.fn(),
      },
    };

    llmProvidersService = new LlmProvidersService(
      openaiServiceMock as any,
      googleServiceMock as any,
      prismaMock as any,
    );
  });

  it('TC-LLM-001 validates plausible API keys for supported providers', async () => {
    // TC-LLM-001
    await expect(
      llmProvidersService.validateApiKey('OPENAI' as Provider, '  sk-proj-abcdefghijklmnopqrstuvwxyz123456  '),
    ).resolves.toBe(true);
    await expect(
      llmProvidersService.validateApiKey('ANTHROPIC' as Provider, 'sk-ant-abcdefghijklmnopqrstuvwxyz123456'),
    ).resolves.toBe(true);
    await expect(
      llmProvidersService.validateApiKey('GOOGLE' as Provider, 'AIzaabcdefghijklmnopqrstuvwxyz123456'),
    ).resolves.toBe(true);
  });

  it('TC-LLM-002 rejects blank or malformed API keys', async () => {
    // TC-LLM-002
    await expect(llmProvidersService.validateApiKey('OPENAI' as Provider, '   ')).resolves.toBe(false);
    await expect(llmProvidersService.validateApiKey('OPENAI' as Provider, 'not-a-real-key')).resolves.toBe(false);
    await expect(llmProvidersService.validateApiKey('GOOGLE' as Provider, 'sk-ant-invalid')).resolves.toBe(false);
    await expect(llmProvidersService.validateApiKey('UNKNOWN' as Provider, 'AIzaabcdefghijklmnopqrstuvwxyz123456')).resolves.toBe(false);
  });

  it('TC-LLM-003 forwards OPENAI generation to the provider service when an active key exists', async () => {
    // TC-LLM-003
    prismaMock.apiKey.findFirst.mockResolvedValue({ keyHash: 'stored-openai-key' });
    openaiServiceMock.generateText.mockResolvedValue('generated text');

    const result = await llmProvidersService.generateText('OPENAI' as Provider, 'Summarize the canvas', 'gpt-4o');

    expect(prismaMock.apiKey.findFirst).toHaveBeenCalledWith({
      where: {
        provider: 'OPENAI',
        isActive: true,
      },
    });
    expect(openaiServiceMock.generateText).toHaveBeenCalledWith('stored-openai-key', 'Summarize the canvas', 'gpt-4o');
    expect(result).toBe('generated text');
  });

  it('TC-LLM-004 fails fast when no active OPENAI key exists', async () => {
    // TC-LLM-004
    prismaMock.apiKey.findFirst.mockResolvedValue(null);

    await expect(llmProvidersService.generateText('OPENAI' as Provider, 'Prompt'))
      .rejects.toBeInstanceOf(BadRequestException);

    expect(openaiServiceMock.generateText).not.toHaveBeenCalled();
  });
});
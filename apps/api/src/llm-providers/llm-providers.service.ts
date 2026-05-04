import { Injectable, BadRequestException } from '@nestjs/common';
import { OpenaiService } from './openai/openai.service';
import { GoogleService } from './google/google.service';
import { Provider } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface StreamParams {
  model: string;
  prompt: string;
  apiKey: string;
  options?: LLMOptions;
}

@Injectable()
export class LlmProvidersService {
  constructor(
    private openaiService: OpenaiService,
    private googleService: GoogleService,
    private prisma: PrismaService
  ) {}

  private isPlausibleOpenAiKey(apiKey: string): boolean {
    return /^sk-(proj-)?[A-Za-z0-9_-]{20,}$/.test(apiKey.trim());
  }

  private isPlausibleAnthropicKey(apiKey: string): boolean {
    return /^sk-ant-[A-Za-z0-9_-]{20,}$/.test(apiKey.trim());
  }

  private isPlausibleGoogleKey(apiKey: string): boolean {
    return /^AIza[0-9A-Za-z\-_]{20,}$/.test(apiKey.trim());
  }

  async validateApiKey(provider: Provider, apiKey: string): Promise<boolean> {
    if (!apiKey?.trim()) {
      return false;
    }

    switch (provider) {
      case 'OPENAI':
        return this.isPlausibleOpenAiKey(apiKey);
      case 'ANTHROPIC':
        return this.isPlausibleAnthropicKey(apiKey);
      case 'GOOGLE':
        return this.isPlausibleGoogleKey(apiKey);
      default:
        return false;
    }
  }
  async generateText(
    provider: Provider,
    prompt: string,
    model?: string
  ): Promise<string> {
    switch (provider) {
      case 'OPENAI':
        const apiKey = await this.prisma.apiKey.findFirst({
          where: {
            provider,
            isActive: true,
          },
        });
        if (!apiKey) {
          throw new BadRequestException('API key not found');
        }
        return this.openaiService.generateText(apiKey.keyHash, prompt, model);
      case 'GOOGLE':
      // return this.googleService.generateText(apiKey, prompt);
      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
    }
  }

  async *streamText(
    provider: Provider,
    prompt: string,
    model?: string,
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): AsyncGenerator<string> {
    switch (provider) {
      case 'OPENAI': {
        const apiKey = await this.prisma.apiKey.findFirst({
          where: { provider, isActive: true },
        });
        if (!apiKey) {
          throw new BadRequestException('API key not found');
        }
        for await (const chunk of this.openaiService.streamText(
          apiKey.keyHash,
          prompt,
          model,
          history
        )) {
          yield chunk;
        }
        return;
      }
      case 'GOOGLE': {
        const apiKey = await this.prisma.apiKey.findFirst({
          where: { provider, isActive: true },
        });
        if (!apiKey) {
          throw new BadRequestException('API key not found');
        }
        for await (const chunk of this.googleService.streamText(
          apiKey.keyHash,
          prompt,
          model,
          history
        )) {
          yield chunk;
        }
        return;
      }
      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
    }
  }
}

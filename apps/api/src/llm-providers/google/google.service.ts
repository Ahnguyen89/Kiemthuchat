import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GoogleService {
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const genAI = new GoogleGenAI({ apiKey });
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Hi',
        config: {
          thinkingConfig: {
            thinkingBudget: 0, // Disables thinking
          },
        },
      });
      if (response.text) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
  async *streamText(
    apiKey: string,
    prompt: string,
    model?: string,
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): AsyncGenerator<string> {
    const genAI = new GoogleGenAI({ apiKey });
    const selectedModel = model || 'gemini-2.5-flash';
    let stream;
    if (history && history.length > 1) {
      const input =
        history && history.length
          ? ([
              // Take all messages except the last one if the last is NOT from assistant
              ...history
                .slice(
                  0,
                  history[history.length - 1].role !== 'assistant'
                    ? history.length - 1
                    : history.length
                )
                .map((m) => ({
                  role: m.role === 'assistant' ? 'model' : m.role,
                  content: m.content,
                })),
            ] as any)
          : (prompt as any);

      const chat = await genAI.chats.create({
        model: selectedModel,
        history: input,
      });

      stream = await chat.sendMessageStream({
        message: prompt,
        config: {
          thinkingConfig: {
            thinkingBudget: 0, // Disables thinking
          },
        },
      });
    } else {
      stream = await genAI.models.generateContentStream({
        model: selectedModel,
        contents: prompt,
      });
    }

    for await (const chunk of stream) {
      yield chunk.text;
    }
  }
}

// Phụ thuộc ngoài được mock; source controller/service vẫn được gọi thật.
import { FlowController } from '../../../src/flow/flow.controller';
import { CanvasAnalysisService } from '../../../src/flow/canvas-analysis.service';
import { TemplateGeneratorService } from '../../../src/flow/template-generator.service';
export const openaiCreate = jest.fn();
export const googleCreate = jest.fn();
export const openaiConstructor = jest.fn();
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((options) => {
    openaiConstructor(options);
    return { chat: { completions: { create: (...args: any[]) => openaiCreate(...args) } } };
  }),
}));
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: (...args: any[]) => googleCreate(...args) },
  })),
}));
export const request = { user: { userId: '1001' } };
export const nodes = [
  {
    id: 'N01',
    type: 'textNode',
    position: { x: 100, y: 100 },
    data: {
      id: 'D01',
      text: 'Workshop Nhập môn Python ngày 25/11/2026 tại A203. Lê Quốc Bảo chuẩn bị slide.',
    },
  },
];
export const template = { nodes, edges: [] };
export const suggestions = ['Kế hoạch workshop', 'Danh sách chuẩn bị', 'Phân công nhân sự'];
export function resetEnvironment() {
  jest.clearAllMocks();
  openaiCreate.mockReset();
  googleCreate.mockReset();
  openaiCreate.mockResolvedValue({ choices: [{ message: { content: 'Phòng A203' } }] });
  googleCreate.mockResolvedValue({ text: 'Phòng A203' });
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
}
export function createAnalysis(systemKey?: string) {
  return new CanvasAnalysisService({ get: jest.fn().mockReturnValue(systemKey) } as any);
}
export function createGenerator(systemKey?: string) {
  return new TemplateGeneratorService({ get: jest.fn().mockReturnValue(systemKey) } as any);
}
export function createController() {
  const flow = {
    findOne: jest.fn().mockResolvedValue({ id: '2001', userId: '1001', nodes, edges: [] }),
  };
  const analysis = {
    answerQuestion: jest.fn().mockResolvedValue('Phòng A203'),
    summarizeCanvas: jest.fn().mockResolvedValue('Workshop Python tại A203'),
  };
  const generator = {
    generateTemplate: jest.fn().mockResolvedValue(template),
    generateTemplateSuggestions: jest.fn().mockResolvedValue(suggestions),
  };
  // Prisma findFirst phải lọc user/provider/isActive; không có kết nối DB thật.
  const prisma = { apiKey: { findFirst: jest.fn().mockResolvedValue({ keyHash: 'google-key' }) } };
  const controller = new FlowController(
    flow as any,
    analysis as any,
    generator as any,
    {} as any,
    {} as any,
    prisma as any,
    {} as any
  );
  return { controller, flow, analysis, generator, prisma };
}

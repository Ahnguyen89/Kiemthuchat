import {
  createController,
  createAnalysis,
  createGenerator,
  nodes,
  template,
  suggestions,
  request,
  openaiCreate,
  googleCreate,
  resetEnvironment,
} from '../support/environment';
describe('TemplateGeneratorService.generateTemplate', () => {
  beforeEach(resetEnvironment);
  afterEach(() => jest.restoreAllMocks());
  // Test Case ID: TC_GEN_009
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_009 Phản hồi hợp lệ', async () => {
    const service = createGenerator();
    openaiCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(template) } }],
    });
    expect(
      await service.generateTemplate(
        { description: 'Kế hoạch workshop', category: 'planning', nodeCount: 5 },
        'user-key'
      )
    ).toEqual(template);
    expect(openaiCreate.mock.calls[0][0].messages[1].content).toContain('Kế hoạch workshop');
  });
  // Test Case ID: TC_GEN_010
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_010 Google thành công', async () => {
    const service = createGenerator();
    googleCreate.mockResolvedValue({ text: JSON.stringify(template) });
    expect(
      await service.generateTemplate(
        { description: 'Kế hoạch workshop', category: 'planning', nodeCount: 5 },
        'google-key',
        'GOOGLE'
      )
    ).toEqual(template);
  });
  // Test Case ID: TC_GEN_011
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_011 Thiếu API key', async () => {
    const service = createGenerator();
    await expect(
      service.generateTemplate({
        description: 'Kế hoạch workshop',
        category: 'planning',
        nodeCount: 5,
      })
    ).rejects.toThrow('OpenAI API key not configured');
    expect(openaiCreate).not.toHaveBeenCalled();
  });
  // Test Case ID: TC_GEN_012
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_012 Provider timeout', async () => {
    const service = createGenerator();
    openaiCreate.mockRejectedValue(new Error('timeout'));
    await expect(
      service.generateTemplate(
        { description: 'Kế hoạch workshop', category: 'planning', nodeCount: 5 },
        'user-key'
      )
    ).rejects.toThrow();
  });
  // Test Case ID: TC_GEN_013
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_013 JSON sai cú pháp', async () => {
    const service = createGenerator();
    openaiCreate.mockResolvedValue({ choices: [{ message: { content: 'not json' } }] });
    await expect(
      service.generateTemplate(
        { description: 'Kế hoạch workshop', category: 'planning', nodeCount: 5 },
        'user-key'
      )
    ).rejects.toThrow();
  });
  // Test Case ID: TC_GEN_014
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_014 Thiếu edges', async () => {
    const service = createGenerator();
    openaiCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ nodes }) } }],
    });
    expect(
      await service.generateTemplate(
        { description: 'Kế hoạch workshop', category: 'planning', nodeCount: 5 },
        'user-key'
      )
    ).toEqual(template);
  });
  // Test Case ID: TC_GEN_015
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_015 Nodes sai kiểu', async () => {
    const service = createGenerator();
    openaiCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ nodes: 'invalid', edges: [] }) } }],
    });
    await expect(
      service.generateTemplate(
        { description: 'Kế hoạch workshop', category: 'planning', nodeCount: 5 },
        'user-key'
      )
    ).rejects.toThrow();
  });
  // Test Case ID: TC_GEN_016
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_016 ID node trùng', async () => {
    const service = createGenerator();
    openaiCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              nodes: [nodes[0], { ...nodes[0], data: { ...nodes[0].data, id: 'D02' } }],
              edges: [],
            }),
          },
        },
      ],
    });
    const result = await service.generateTemplate(
      { description: 'Kế hoạch workshop', category: 'planning', nodeCount: 5 },
      'user-key'
    );
    expect(new Set(result.nodes.map((n) => n.id)).size).toBe(result.nodes.length);
  });
});

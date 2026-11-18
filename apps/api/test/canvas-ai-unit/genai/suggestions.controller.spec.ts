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
describe('FlowController.generateTemplateSuggestions', () => {
  beforeEach(resetEnvironment);
  afterEach(() => jest.restoreAllMocks());
  // Test Case ID: TC_GEN_017
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_017 Yêu cầu hợp lệ', async () => {
    const context = createController();
    expect(
      await context.controller.generateTemplateSuggestions(request, {
        description: 'Tạo template quản lý workshop',
      })
    ).toEqual({ success: true, data: { suggestions } });
    expect(context.generator.generateTemplateSuggestions).toHaveBeenCalledTimes(1);
  });
  // Test Case ID: TC_GEN_018
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_018 Mô tả rỗng', async () => {
    const context = createController();
    expect(
      await context.controller.generateTemplateSuggestions(request, { description: '' } as any)
    ).toEqual({ success: false, message: 'Description is required' });
    expect(context.generator.generateTemplateSuggestions).not.toHaveBeenCalled();
    expect(context.prisma.apiKey.findFirst).not.toHaveBeenCalled();
  });
  // Test Case ID: TC_GEN_019
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_019 Mô tả null', async () => {
    const context = createController();
    expect(
      await context.controller.generateTemplateSuggestions(request, { description: null } as any)
    ).toEqual({ success: false, message: 'Description is required' });
    expect(context.generator.generateTemplateSuggestions).not.toHaveBeenCalled();
    expect(context.prisma.apiKey.findFirst).not.toHaveBeenCalled();
  });
  // Test Case ID: TC_GEN_020
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_020 Thiếu mô tả', async () => {
    const context = createController();
    expect(
      await context.controller.generateTemplateSuggestions(request, {
        description: undefined,
      } as any)
    ).toEqual({ success: false, message: 'Description is required' });
    expect(context.generator.generateTemplateSuggestions).not.toHaveBeenCalled();
    expect(context.prisma.apiKey.findFirst).not.toHaveBeenCalled();
  });
  // Test Case ID: TC_GEN_021
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_021 Chọn key OpenAI', async () => {
    const context = createController();
    context.prisma.apiKey.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ keyHash: 'openai-key' });
    await context.controller.generateTemplateSuggestions(request, {
      description: 'Tạo template quản lý workshop',
    });
    expect(context.generator.generateTemplateSuggestions.mock.calls[0].slice(-2)).toEqual([
      'openai-key',
      'OPENAI',
    ]);
  });
  // Test Case ID: TC_GEN_022
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_022 Không có key cá nhân', async () => {
    const context = createController();
    context.prisma.apiKey.findFirst.mockResolvedValue(null);
    await context.controller.generateTemplateSuggestions(request, {
      description: 'Tạo template quản lý workshop',
    });
    expect(context.generator.generateTemplateSuggestions.mock.calls[0].slice(-2)).toEqual([
      undefined,
      undefined,
    ]);
  });
  // Test Case ID: TC_GEN_023
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_023 Truy vấn key thất bại', async () => {
    const context = createController();
    context.prisma.apiKey.findFirst.mockRejectedValue(new Error('DB error'));
    await expect(
      context.controller.generateTemplateSuggestions(request, {
        description: 'Tạo template quản lý workshop',
      })
    ).rejects.toThrow('DB error');
    expect(context.generator.generateTemplateSuggestions).not.toHaveBeenCalled();
  });
  // Test Case ID: TC_GEN_024
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_024 Service AI thất bại', async () => {
    const context = createController();
    context.generator.generateTemplateSuggestions.mockRejectedValue(new Error('timeout'));
    await expect(
      context.controller.generateTemplateSuggestions(request, {
        description: 'Tạo template quản lý workshop',
      })
    ).rejects.toThrow('timeout');
  });
});

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
describe('FlowController.generateTemplate', () => {
  beforeEach(resetEnvironment);
  afterEach(() => jest.restoreAllMocks());
  // Test Case ID: TC_GEN_001
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_001 Yêu cầu hợp lệ', async () => {
    const context = createController();
    expect(
      await context.controller.generateTemplate(request, {
        description: 'Tạo template quản lý workshop',
      })
    ).toEqual({ success: true, data: template });
    expect(context.generator.generateTemplate).toHaveBeenCalledTimes(1);
  });
  // Test Case ID: TC_GEN_002
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_002 Mô tả rỗng', async () => {
    const context = createController();
    expect(await context.controller.generateTemplate(request, { description: '' } as any)).toEqual({
      success: false,
      message: 'Description is required',
    });
    expect(context.generator.generateTemplate).not.toHaveBeenCalled();
    expect(context.prisma.apiKey.findFirst).not.toHaveBeenCalled();
  });
  // Test Case ID: TC_GEN_003
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_003 Mô tả null', async () => {
    const context = createController();
    expect(
      await context.controller.generateTemplate(request, { description: null } as any)
    ).toEqual({
      success: false,
      message: 'Description is required',
    });
    expect(context.generator.generateTemplate).not.toHaveBeenCalled();
    expect(context.prisma.apiKey.findFirst).not.toHaveBeenCalled();
  });
  // Test Case ID: TC_GEN_004
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_004 Thiếu mô tả', async () => {
    const context = createController();
    expect(
      await context.controller.generateTemplate(request, { description: undefined } as any)
    ).toEqual({ success: false, message: 'Description is required' });
    expect(context.generator.generateTemplate).not.toHaveBeenCalled();
    expect(context.prisma.apiKey.findFirst).not.toHaveBeenCalled();
  });
  // Test Case ID: TC_GEN_005
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_005 Chọn key OpenAI', async () => {
    const context = createController();
    context.prisma.apiKey.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ keyHash: 'openai-key' });
    await context.controller.generateTemplate(request, {
      description: 'Tạo template quản lý workshop',
    });
    expect(context.generator.generateTemplate.mock.calls[0].slice(-2)).toEqual([
      'openai-key',
      'OPENAI',
    ]);
  });
  // Test Case ID: TC_GEN_006
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_006 Không có key cá nhân', async () => {
    const context = createController();
    context.prisma.apiKey.findFirst.mockResolvedValue(null);
    await context.controller.generateTemplate(request, {
      description: 'Tạo template quản lý workshop',
    });
    expect(context.generator.generateTemplate.mock.calls[0].slice(-2)).toEqual([
      undefined,
      undefined,
    ]);
  });
  // Test Case ID: TC_GEN_007
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_007 Truy vấn key thất bại', async () => {
    const context = createController();
    context.prisma.apiKey.findFirst.mockRejectedValue(new Error('DB error'));
    await expect(
      context.controller.generateTemplate(request, { description: 'Tạo template quản lý workshop' })
    ).rejects.toThrow('DB error');
    expect(context.generator.generateTemplate).not.toHaveBeenCalled();
  });
  // Test Case ID: TC_GEN_008
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_008 Service AI thất bại', async () => {
    const context = createController();
    context.generator.generateTemplate.mockRejectedValue(new Error('timeout'));
    await expect(
      context.controller.generateTemplate(request, { description: 'Tạo template quản lý workshop' })
    ).rejects.toThrow('timeout');
  });
});

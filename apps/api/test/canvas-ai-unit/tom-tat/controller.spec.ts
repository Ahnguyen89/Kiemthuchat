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
describe('FlowController.summarizeCanvas', () => {
  beforeEach(resetEnvironment);
  afterEach(() => jest.restoreAllMocks());
  // Test Case ID: TC_SUM_001
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_SUM_001 Xử lý yêu cầu hợp lệ', async () => {
    const context = createController();
    const actual = await context.controller.summarizeCanvas(request, '2001');
    expect(actual).toEqual({ success: true, data: { summary: 'Workshop Python t\u1ea1i A203' } });
    expect(context.analysis.summarizeCanvas).toHaveBeenCalledTimes(1);
    expect(context.prisma.apiKey.findFirst).toHaveBeenCalledWith({
      where: { userId: '1001', provider: 'GOOGLE', isActive: true },
    });
  });
  // Test Case ID: TC_SUM_002
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_SUM_002 Canvas không tồn tại', async () => {
    const context = createController();
    context.flow.findOne.mockRejectedValue(new Error('Flow not found'));
    await expect(context.controller.summarizeCanvas(request, '9999')).rejects.toThrow(
      'Flow not found'
    );
    expect(context.analysis.summarizeCanvas).not.toHaveBeenCalled();
  });
  // Test Case ID: TC_SUM_003
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_SUM_003 Không có quyền truy cập', async () => {
    const context = createController();
    context.flow.findOne.mockRejectedValue(new Error('Access denied'));
    await expect(context.controller.summarizeCanvas(request, '2001')).rejects.toThrow(
      'Access denied'
    );
    expect(context.analysis.summarizeCanvas).not.toHaveBeenCalled();
  });
  // Test Case ID: TC_SUM_004
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_SUM_004 Dùng key OpenAI cá nhân', async () => {
    const context = createController();
    context.prisma.apiKey.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ keyHash: 'openai-key' });
    await context.controller.summarizeCanvas(request, '2001');
    expect(context.analysis.summarizeCanvas).toHaveBeenCalledWith(
      nodes,
      [],
      'openai-key',
      'OPENAI'
    );
    expect(context.prisma.apiKey.findFirst).toHaveBeenLastCalledWith({
      where: { userId: '1001', provider: 'OPENAI', isActive: true },
    });
  });
  // Test Case ID: TC_SUM_005
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_SUM_005 Không có key cá nhân', async () => {
    const context = createController();
    context.prisma.apiKey.findFirst.mockResolvedValue(null);
    await context.controller.summarizeCanvas(request, '2001');
    expect(context.analysis.summarizeCanvas).toHaveBeenCalledWith(nodes, [], undefined, undefined);
  });
  // Test Case ID: TC_SUM_006
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_SUM_006 Dịch vụ AI timeout', async () => {
    const context = createController();
    context.analysis.summarizeCanvas.mockRejectedValue(new Error('timeout'));
    await expect(context.controller.summarizeCanvas(request, '2001')).rejects.toThrow('timeout');
  });
  // Test Case ID: TC_SUM_007
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_SUM_007 Chuẩn hóa nodes không phải mảng', async () => {
    const context = createController();
    context.flow.findOne.mockResolvedValue({
      id: '2001',
      userId: '1001',
      nodes,
      edges: [],
      nodes: null,
    } as any);
    await context.controller.summarizeCanvas(request, '2001');
    const sent = context.analysis.summarizeCanvas.mock.calls[0];
    expect(sent[0]).toEqual([]);
  });
  // Test Case ID: TC_SUM_008
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_SUM_008 Chuẩn hóa edges không phải mảng', async () => {
    const context = createController();
    context.flow.findOne.mockResolvedValue({
      id: '2001',
      userId: '1001',
      nodes,
      edges: [],
      edges: null,
    } as any);
    await context.controller.summarizeCanvas(request, '2001');
    const sent = context.analysis.summarizeCanvas.mock.calls[0];
    expect(sent[1]).toEqual([]);
  });
});

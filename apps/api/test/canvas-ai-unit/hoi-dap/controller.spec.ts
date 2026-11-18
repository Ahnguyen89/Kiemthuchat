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
describe('FlowController.askQuestion', () => {
  beforeEach(resetEnvironment);
  afterEach(() => jest.restoreAllMocks());
  // Test Case ID: TC_QA_001
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_QA_001 Xử lý yêu cầu hợp lệ', async () => {
    const context = createController();
    const actual = await context.controller.askQuestion(request, '2001', {
      question: 'Workshop diễn ra ở đâu?',
    });
    expect(actual).toEqual({ success: true, data: { answer: 'Ph\u00f2ng A203' } });
    expect(context.analysis.answerQuestion).toHaveBeenCalledTimes(1);
    expect(context.prisma.apiKey.findFirst).toHaveBeenCalledWith({
      where: { userId: '1001', provider: 'GOOGLE', isActive: true },
    });
  });
  // Test Case ID: TC_QA_002
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_QA_002 Canvas không tồn tại', async () => {
    const context = createController();
    context.flow.findOne.mockRejectedValue(new Error('Flow not found'));
    await expect(
      context.controller.askQuestion(request, '9999', { question: 'Workshop diễn ra ở đâu?' })
    ).rejects.toThrow('Flow not found');
    expect(context.analysis.answerQuestion).not.toHaveBeenCalled();
  });
  // Test Case ID: TC_QA_003
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_QA_003 Không có quyền truy cập', async () => {
    const context = createController();
    context.flow.findOne.mockRejectedValue(new Error('Access denied'));
    await expect(
      context.controller.askQuestion(request, '2001', { question: 'Workshop diễn ra ở đâu?' })
    ).rejects.toThrow('Access denied');
    expect(context.analysis.answerQuestion).not.toHaveBeenCalled();
  });
  // Test Case ID: TC_QA_004
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_QA_004 Dùng key OpenAI cá nhân', async () => {
    const context = createController();
    context.prisma.apiKey.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ keyHash: 'openai-key' });
    await context.controller.askQuestion(request, '2001', { question: 'Workshop diễn ra ở đâu?' });
    expect(context.analysis.answerQuestion).toHaveBeenCalledWith(
      nodes,
      [],
      'Workshop diễn ra ở đâu?',
      'openai-key',
      'OPENAI'
    );
    expect(context.prisma.apiKey.findFirst).toHaveBeenLastCalledWith({
      where: { userId: '1001', provider: 'OPENAI', isActive: true },
    });
  });
  // Test Case ID: TC_QA_005
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_QA_005 Không có key cá nhân', async () => {
    const context = createController();
    context.prisma.apiKey.findFirst.mockResolvedValue(null);
    await context.controller.askQuestion(request, '2001', { question: 'Workshop diễn ra ở đâu?' });
    expect(context.analysis.answerQuestion).toHaveBeenCalledWith(
      nodes,
      [],
      'Workshop diễn ra ở đâu?',
      undefined,
      undefined
    );
  });
  // Test Case ID: TC_QA_006
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_QA_006 Dịch vụ AI timeout', async () => {
    const context = createController();
    context.analysis.answerQuestion.mockRejectedValue(new Error('timeout'));
    await expect(
      context.controller.askQuestion(request, '2001', { question: 'Workshop diễn ra ở đâu?' })
    ).rejects.toThrow('timeout');
  });
  // Test Case ID: TC_QA_007
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_QA_007 Câu hỏi rỗng', async () => {
    const context = createController();
    expect(await context.controller.askQuestion(request, '2001', { question: '' } as any)).toEqual({
      success: false,
      message: 'Question is required',
    });
    expect(context.flow.findOne).not.toHaveBeenCalled();
    expect(context.analysis.answerQuestion).not.toHaveBeenCalled();
  });
  // Test Case ID: TC_QA_008
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_QA_008 Thiếu câu hỏi', async () => {
    const context = createController();
    expect(
      await context.controller.askQuestion(request, '2001', { question: undefined } as any)
    ).toEqual({ success: false, message: 'Question is required' });
    expect(context.flow.findOne).not.toHaveBeenCalled();
    expect(context.analysis.answerQuestion).not.toHaveBeenCalled();
  });
});

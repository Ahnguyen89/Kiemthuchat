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
describe('CanvasAnalysisService.summarizeCanvas', () => {
  beforeEach(resetEnvironment);
  afterEach(() => jest.restoreAllMocks());
  // Test Case ID: TC_SUM_009
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_SUM_009 Nhận phản hồi OpenAI', async () => {
    const service = createAnalysis();
    expect(await service.summarizeCanvas(nodes, [], 'user-key', 'OPENAI')).toBe('Phòng A203');
    const payload = openaiCreate.mock.calls[0][0];
    expect(payload.messages[1].content).toContain(nodes[0].data.text);
  });
  // Test Case ID: TC_SUM_010
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_SUM_010 Nhận phản hồi Google', async () => {
    const service = createAnalysis();
    expect(await service.summarizeCanvas(nodes, [], 'user-key', 'GOOGLE')).toBe('Phòng A203');
    expect(googleCreate.mock.calls[0][0].contents).toContain(nodes[0].data.text);
    expect(openaiCreate).not.toHaveBeenCalled();
  });
  // Test Case ID: TC_SUM_011
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_SUM_011 Ưu tiên key cá nhân', async () => {
    const service = createAnalysis('system-key');
    await service.summarizeCanvas(nodes, [], 'user-key', 'OPENAI');
    const { openaiConstructor } = require('../support/environment');
    expect(openaiConstructor).toHaveBeenLastCalledWith({ apiKey: 'user-key' });
  });
  // Test Case ID: TC_SUM_012
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_SUM_012 Dùng key hệ thống', async () => {
    const service = createAnalysis('system-key');
    expect(await service.summarizeCanvas(nodes, [], undefined, 'OPENAI')).toBe('Phòng A203');
    const { openaiConstructor } = require('../support/environment');
    expect(openaiConstructor).toHaveBeenCalledTimes(1);
    expect(openaiConstructor).toHaveBeenCalledWith({ apiKey: 'system-key' });
  });
  // Test Case ID: TC_SUM_013
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_SUM_013 Thiếu toàn bộ key', async () => {
    const service = createAnalysis();
    await expect(service.summarizeCanvas(nodes, [], undefined, 'OPENAI')).rejects.toThrow(
      'OpenAI API key not configured'
    );
    expect(openaiCreate).not.toHaveBeenCalled();
  });
  // Test Case ID: TC_SUM_014
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_SUM_014 API key sai', async () => {
    const service = createAnalysis();
    openaiCreate.mockRejectedValue(new Error('401'));
    await expect(service.summarizeCanvas(nodes, [], 'user-key', 'OPENAI')).rejects.toThrow();
  });
  // Test Case ID: TC_SUM_015
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_SUM_015 Provider timeout', async () => {
    const service = createAnalysis();
    openaiCreate.mockRejectedValue(new Error('timeout'));
    await expect(service.summarizeCanvas(nodes, [], 'user-key', 'OPENAI')).rejects.toThrow();
  });
  // Test Case ID: TC_SUM_016
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_SUM_016 Mất kết nối provider', async () => {
    const service = createAnalysis();
    openaiCreate.mockRejectedValue(new Error('Network error'));
    await expect(service.summarizeCanvas(nodes, [], 'user-key', 'OPENAI')).rejects.toThrow();
  });
});

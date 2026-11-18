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
describe('TemplateGeneratorService.generateTemplateSuggestions', () => {
  beforeEach(resetEnvironment);
  afterEach(() => jest.restoreAllMocks());
  // Test Case ID: TC_GEN_025
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_025 Phản hồi hợp lệ', async () => {
    const service = createGenerator();
    openaiCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ suggestions }) } }],
    });
    expect(await service.generateTemplateSuggestions('Kế hoạch workshop', 'user-key')).toEqual(
      suggestions
    );
    expect(openaiCreate.mock.calls[0][0].messages[1].content).toContain('Kế hoạch workshop');
  });
  // Test Case ID: TC_GEN_026
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_026 Google thành công', async () => {
    const service = createGenerator();
    googleCreate.mockResolvedValue({ text: JSON.stringify({ suggestions }) });
    expect(
      await service.generateTemplateSuggestions('Kế hoạch workshop', 'google-key', 'GOOGLE')
    ).toEqual(suggestions);
  });
  // Test Case ID: TC_GEN_027
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_027 Thiếu API key', async () => {
    const service = createGenerator();
    await expect(service.generateTemplateSuggestions('Kế hoạch workshop')).rejects.toThrow(
      'OpenAI API key not configured'
    );
    expect(openaiCreate).not.toHaveBeenCalled();
  });
  // Test Case ID: TC_GEN_028
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_028 Provider timeout', async () => {
    const service = createGenerator();
    openaiCreate.mockRejectedValue(new Error('timeout'));
    await expect(
      service.generateTemplateSuggestions('Kế hoạch workshop', 'user-key')
    ).rejects.toThrow();
  });
  // Test Case ID: TC_GEN_029
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_029 JSON sai cú pháp', async () => {
    const service = createGenerator();
    openaiCreate.mockResolvedValue({ choices: [{ message: { content: 'not json' } }] });
    await expect(
      service.generateTemplateSuggestions('Kế hoạch workshop', 'user-key')
    ).rejects.toThrow();
  });
  // Test Case ID: TC_GEN_030
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_030 Danh sách 4 gợi ý', async () => {
    const service = createGenerator();
    const list = Array.from({ length: 4 }, (_, i) => 'Phương án ' + (i + 1));
    openaiCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ suggestions: list }) } }],
    });
    expect(await service.generateTemplateSuggestions('Kế hoạch workshop', 'user-key')).toEqual(
      list
    );
  });
  // Test Case ID: TC_GEN_031
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_031 Danh sách 5 gợi ý', async () => {
    const service = createGenerator();
    const list = Array.from({ length: 5 }, (_, i) => 'Phương án ' + (i + 1));
    openaiCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ suggestions: list }) } }],
    });
    expect(await service.generateTemplateSuggestions('Kế hoạch workshop', 'user-key')).toEqual(
      list
    );
  });
  // Test Case ID: TC_GEN_032
  // Arrange: thiết lập canvas/key và phản hồi phụ thuộc để đi vào nhánh cần test.
  // Act/Assert: gọi phương thức thật và kiểm tra giá trị trả về hoặc lỗi.
  it('TC_GEN_032 Prompt yêu cầu số lượng gợi ý', async () => {
    const service = createGenerator();
    openaiCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ suggestions }) } }],
    });
    await service.generateTemplateSuggestions('Kế hoạch workshop', 'user-key');
    expect(openaiCreate.mock.calls[0][0].messages[0].content).toContain('3-5');
  });
});

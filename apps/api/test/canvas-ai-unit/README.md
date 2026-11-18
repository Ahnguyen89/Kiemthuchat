# Unit test Canvas AI

Người thực hiện: Nguyên Đình Anh. Dữ liệu giả lập: userId `1001`, canvasId `2001`.

## Chạy test

Từ thư mục `apps/api`:

```powershell
npx jest --config test/canvas-ai-unit/jest.config.cjs --runInBand --coverage
```

Hoặc chạy từ thư mục bất kỳ:

```powershell
powershell -ExecutionPolicy Bypass -File D:\Kiemthuchatluongpm\Kiemthuchat\apps\api\test\canvas-ai-unit\run-tests.ps1
```

Chạy riêng tính năng bằng tham số `-Feature hoi-dap`, `-Feature tom-tat`, hoặc `-Feature genai`.
Chạy riêng sẽ ghi đè JSON và coverage của lần chạy trước; Excel đi kèm phản ánh lần chạy đủ 64 ca.

## Phạm vi

- `hoi-dap`: askQuestion (controller), answerQuestion (service), 16 ca.
- `tom-tat`: summarizeCanvas (controller và service), 16 ca.
- `genai`: generateTemplate và generateTemplateSuggestions (controller và service), 32 ca.
- `support/environment.ts`: fixture và mock dùng chung; không phải source nghiệp vụ.
- `cases.json`: danh sách ID, input và expected khớp với test script/Excel.

Mỗi phương thức có 8 ca. Các file `.spec.ts` có comment ID và các assertion gọi source thật.
SDK AI và Prisma là mock. Không cần bật frontend/backend, không cần key API hay DB thật.
Đối tượng người dùng trong request được giả lập; JWT guard/HTTP không được kiểm tra ở bộ này.

## Kết quả và giới hạn

Lần chạy ngày 18/11/2026: 64 ca, 63 Pass, 1 Fail.
`TC_GEN_016`: thiết kế yêu cầu ID duy nhất nhưng source giữ hai node cùng ID. Giữ nguyên test thất bại, không sửa expected để khớp lỗi.
Vì vậy Jest trả exit code 1 là kết quả đúng của lần chạy, không phải lỗi cấu hình.

Coverage tính toàn bộ 3 file, gồm cả hàm ngoài phạm vi và hàm private nhiều nhánh. Chưa đạt 100% branch coverage.
Không đánh giá chất lượng suy luận của AI, không chạy API thật.

### CheckDB / Rollback

Controller được kiểm tra lời gọi Prisma có filter đúng userId/provider/isActive và không ghi dữ liệu.
Đây chỉ là kiểm tra truy vấn bằng mock, không chứng minh DB thật. Không có thao tác DB thật nên rollback không áp dụng.
`jest.clearAllMocks` không phải rollback. Nếu giảng viên yêu cầu kiểm tra DB thật, phải bổ sung test tích hợp DB riêng.
Các hàm create/update/findOne của FlowService nằm ngoài phạm vi đã chốt và không được test riêng.

## Căn cứ expected

- CANVAS_AI_FEATURE.md: ngữ cảnh, phản hồi đầy đủ, key cá nhân trước hệ thống, lỗi, quyền.
- AI_TEMPLATE_GENERATOR.md: schema response template/gợi ý, 3–5 phương án, lỗi cấu hình key.
- Duc-Hieu-Cuong-Dat- final_2.docx: Bảng 2.7, tuần tự 2.6.6, hoạt động 2.7.2 (edges rỗng và ID duy nhất).
- 01_SQA.docx: Correctness, Integrity.
- Các chuỗi Question/Description is required và chuẩn hóa array là kiểm tra hợp đồng hiện tại; chi tiết này chưa đầy đủ trong đặc tả và cần xác nhận.
- Quy tắc Google trước OpenAI chưa được ghi rõ trong tài liệu; test kiểm tra đường gọi hiện tại, không tự xem là yêu cầu được phê duyệt.

Remote hiện có: https://github.com/Ahnguyen89/Kiemthuchat . Các file mới chưa được commit/push; không coi remote là bằng chứng script đã xuất bản.

Kết quả máy đọc: `results/jest-results.json`; log: `results/execution.log`; báo cáo coverage: `results/coverage/index.html`.

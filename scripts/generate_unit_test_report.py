from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_WORKBOOK = ROOT / 'UNIT_TEST_REPORT.xlsx'
COVERAGE_SUMMARY_FILE = ROOT / 'apps' / 'api' / 'coverage' / 'coverage-summary.json'
LCOV_REPORT_INDEX = ROOT / 'apps' / 'api' / 'coverage' / 'lcov-report' / 'index.html'

PROJECT_GITHUB_URL = 'Chưa có remote GitHub trong workspace'


@dataclass(frozen=True)
class TestCaseRow:
    file_name: str
    test_id: str
    objective: str
    input_data: str
    expected_output: str
    notes: str


TEST_STACK_ROWS = [
    ('Framework kiểm thử', 'Jest'),
    ('Công cụ chuyển đổi TypeScript', 'ts-jest'),
    ('Hỗ trợ module NestJS trong test', '@nestjs/testing'),
    ('Mocking', 'Jest mocks / jest.spyOn'),
    ('Coverage', 'Jest coverage'),
]

TEST_SCOPE_ROWS = [
    ('Được kiểm thử', 'AuthService.validateUserForLogin', 'Có nhánh xử lý khác nhau theo trạng thái SMTP và trạng thái email; dễ kiểm thử bằng mock Prisma, UsersService và bcrypt.'),
    ('Được kiểm thử', 'LlmProvidersService.validateApiKey', 'Là logic thuần xác thực định dạng key, không cần I/O ngoài.'),
    ('Được kiểm thử', 'LlmProvidersService.generateText', 'Nhánh mở đầu kiểm tra key trong Prisma và ủy quyền sang provider service có thể mock hoàn toàn.'),
    ('Được kiểm thử', 'FlowService.update', 'Có nhánh lưu phiên bản và ghi audit khi manual save; có thể xác minh bằng mock service.'),
    ('Không cần kiểm thử đơn vị', 'auth.controller.ts', 'Lớp controller chủ yếu chuyển tiếp request sang service; logic nghiệp vụ đã được kiểm trong service.'),
    ('Không cần kiểm thử đơn vị', 'flow.controller.ts', 'Chủ yếu điều phối request/response và gọi service; rủi ro nghiệp vụ thấp.'),
    ('Không cần kiểm thử đơn vị', 'dto/*', 'DTO chỉ mô tả cấu trúc dữ liệu và validation declarative, không có logic nghiệp vụ phức tạp.'),
    ('Không cần kiểm thử đơn vị', 'main.ts / module files', 'Khởi tạo ứng dụng và wiring module; phù hợp hơn với smoke/integration test.'),
]

TEST_CASES = [
    TestCaseRow(
        file_name='auth.service.ts',
        test_id='TC-AUTH-001',
        objective='Xác minh user hợp lệ được auto-verify trong môi trường local/dev khi SMTP chưa được cấu hình thật.',
        input_data='Email đã normalize, mật khẩu đúng, SMTP_USER/SMTP_PASS còn placeholder.',
        expected_output='Prisma cập nhật isEmailVerified=true và hàm trả về user đã xác minh.',
        notes='Kiểm tra DB bằng mock: phải gọi prisma.user.update với đúng điều kiện.'
    ),
    TestCaseRow(
        file_name='auth.service.ts',
        test_id='TC-AUTH-002',
        objective='Xác minh user chưa verify bị chặn khi SMTP thật đã được cấu hình.',
        input_data='Email đúng, mật khẩu đúng, SMTP_USER/SMTP_PASS là giá trị thật.',
        expected_output='Hàm ném BadRequestException và gọi resendVerificationCode cho email tương ứng.',
        notes='Không được cập nhật DB user trong nhánh này.'
    ),
    TestCaseRow(
        file_name='llm-providers.service.ts',
        test_id='TC-LLM-001',
        objective='Xác minh validateApiKey chấp nhận key hợp lệ cho OPENAI, ANTHROPIC và GOOGLE.',
        input_data='Các key mô phỏng đúng format, có khoảng trắng đầu/cuối để kiểm tra trim.',
        expected_output='Hàm trả về true cho từng provider.',
        notes='Là logic thuần, không chạm DB hay mạng.'
    ),
    TestCaseRow(
        file_name='llm-providers.service.ts',
        test_id='TC-LLM-002',
        objective='Xác minh validateApiKey từ chối key rỗng hoặc sai định dạng.',
        input_data='Chuỗi rỗng, chuỗi không khớp pattern, provider không hỗ trợ.',
        expected_output='Hàm trả về false.',
        notes='Bao phủ nhánh fail-fast của validateApiKey.'
    ),
    TestCaseRow(
        file_name='llm-providers.service.ts',
        test_id='TC-LLM-003',
        objective='Xác minh generateText dùng active API key trong Prisma rồi chuyển yêu cầu sang OpenAI service.',
        input_data='Provider OPENAI, prompt bất kỳ, Prisma trả về keyHash hợp lệ.',
        expected_output='OpenaiService.generateText được gọi với keyHash và result được trả về.',
        notes='Kiểm tra DB bằng mock: prisma.apiKey.findFirst phải được gọi đúng filter.'
    ),
    TestCaseRow(
        file_name='llm-providers.service.ts',
        test_id='TC-LLM-004',
        objective='Xác minh generateText fail-fast khi không có API key active.',
        input_data='Provider OPENAI nhưng Prisma trả về null.',
        expected_output='Hàm ném BadRequestException với thông báo API key not found.',
        notes='Không được gọi provider service khi thiếu key.'
    ),
    TestCaseRow(
        file_name='flow.service.ts',
        test_id='TC-FLOW-001',
        objective='Xác minh manual save tạo version, ghi audit log và lưu nội dung mới.',
        input_data='Flow thuộc user hiện tại, có nodes/edges cũ; DTO gửi nodes/edges mới và isManualSave=true.',
        expected_output='FlowVersionService, FlowAuditService và Prisma update được gọi với dữ liệu đúng.',
        notes='Kiểm tra DB bằng mock, đồng thời xác minh dữ liệu old/new được truyền vào detectAndLogChanges.'
    ),
    TestCaseRow(
        file_name='flow.service.ts',
        test_id='TC-FLOW-002',
        objective='Xác minh autosave hoặc patch update không kích hoạt snapshot/audit phụ.',
        input_data='DTO chỉ có field cần cập nhật và isManualSave=false.',
        expected_output='Chỉ prisma.flow.update được gọi; versionService và auditService không được gọi.',
        notes='Giữ cho autosave nhẹ và không tạo version thừa.'
    ),
]

COMMAND_ROWS = [
    'npm --workspace apps/api test -- --runInBand',
    'npm --workspace apps/api test -- --runInBand --coverage --coverageReporters=json-summary --coverageReporters=text-summary',
    'python scripts/generate_unit_test_report.py',
]

REFERENCES_ROWS = [
    ('Jest docs', 'https://jestjs.io/docs/getting-started'),
    ('NestJS testing', 'https://docs.nestjs.com/fundamentals/unit-testing'),
    ('Coverage guide', 'https://jestjs.io/docs/configuration#collectcoverage-from-array'),
    ('Project docs', 'README.md, docs/SETUP.md, docs/CANVAS_QUICKSTART.md'),
]


def load_coverage_summary() -> dict[str, Any] | None:
    if not COVERAGE_SUMMARY_FILE.exists():
        return None

    with COVERAGE_SUMMARY_FILE.open('r', encoding='utf-8') as coverage_file:
        return json.load(coverage_file)


def style_header(cell) -> None:
    cell.font = Font(bold=True, color='FFFFFF')
    cell.fill = PatternFill('solid', fgColor='1F4E78')
    cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)


def style_body(cell, wrap: bool = True) -> None:
    cell.alignment = Alignment(vertical='top', wrap_text=wrap)


def autofit_columns(sheet) -> None:
    for column_cells in sheet.columns:
        max_length = 0
        column_letter = get_column_letter(column_cells[0].column)
        for cell in column_cells:
            value = '' if cell.value is None else str(cell.value)
            if len(value) > max_length:
                max_length = len(value)
        sheet.column_dimensions[column_letter].width = min(max_length + 4, 55)


def add_title(sheet, title: str, subtitle: str | None = None) -> None:
    sheet['A1'] = title
    sheet['A1'].font = Font(bold=True, size=16)
    if subtitle:
        sheet['A2'] = subtitle
        sheet['A2'].font = Font(italic=True, color='666666')


def write_table(sheet, start_row: int, headers: list[str], rows: list[list[Any]]) -> int:
    current_row = start_row
    for column_index, header in enumerate(headers, start=1):
        cell = sheet.cell(current_row, column_index, header)
        style_header(cell)

    for row in rows:
        current_row += 1
        for column_index, value in enumerate(row, start=1):
            cell = sheet.cell(current_row, column_index, value)
            style_body(cell)

    return current_row


def write_overview_sheet(workbook: Workbook) -> None:
    sheet = workbook.active
    sheet.title = 'Tong_quan'
    add_title(sheet, 'Báo cáo kiểm thử đơn vị', 'Dự án Canvas LLM Platform')

    rows = [
        ['Framework kiểm thử', 'Jest + ts-jest'],
        ['Thư viện hỗ trợ', '@nestjs/testing, @types/jest, bcrypt mock, Prisma mock'],
        ['Phạm vi kiểm thử', 'Các service có logic nghiệp vụ và nhánh DB/API có thể mock hoàn toàn'],
        ['URL GitHub', PROJECT_GITHUB_URL],
        ['Thư mục coverage HTML', str(LCOV_REPORT_INDEX.relative_to(ROOT)) if LCOV_REPORT_INDEX.exists() else 'Chưa có coverage HTML'],
    ]

    current_row = 4
    for key, value in rows:
        sheet.cell(current_row, 1, key)
        sheet.cell(current_row, 2, value)
        style_body(sheet.cell(current_row, 1), wrap=False)
        style_body(sheet.cell(current_row, 2))
        current_row += 1

    autofit_columns(sheet)


def write_scope_sheet(workbook: Workbook) -> None:
    sheet = workbook.create_sheet('Pham_vi')
    add_title(sheet, 'Phạm vi kiểm thử', 'Các hạng mục được kiểm thử và các hạng mục không cần kiểm thử đơn vị')

    headers = ['Trạng thái', 'Tệp / Lớp / Hàm', 'Lý do']
    rows = [[status, target, reason] for status, target, reason in TEST_SCOPE_ROWS]
    write_table(sheet, 4, headers, rows)
    autofit_columns(sheet)


def write_test_case_sheet(workbook: Workbook) -> None:
    sheet = workbook.create_sheet('Test_cases')
    add_title(sheet, 'Các trường hợp kiểm thử đơn vị', 'Sắp xếp theo tên tệp / lớp')

    headers = ['Tệp / Lớp', 'Mã số', 'Mục tiêu kiểm thử', 'Đầu vào', 'Đầu ra mong đợi', 'Ghi chú']
    rows = [[case.file_name, case.test_id, case.objective, case.input_data, case.expected_output, case.notes] for case in TEST_CASES]
    write_table(sheet, 4, headers, rows)
    autofit_columns(sheet)


def get_total_counts(coverage_summary: dict[str, Any] | None) -> dict[str, float]:
    if not coverage_summary:
        return {'lines': 0.0, 'statements': 0.0, 'functions': 0.0, 'branches': 0.0}

    total = coverage_summary.get('total', {})
    return {
        'lines': float(total.get('lines', {}).get('pct', 0.0)),
        'statements': float(total.get('statements', {}).get('pct', 0.0)),
        'functions': float(total.get('functions', {}).get('pct', 0.0)),
        'branches': float(total.get('branches', {}).get('pct', 0.0)),
    }


def write_execution_sheet(workbook: Workbook, coverage_summary: dict[str, Any] | None) -> None:
    sheet = workbook.create_sheet('Thuc_thi')
    add_title(sheet, 'Báo cáo thực thi', 'Dựa trên kết quả Jest chạy trong workspace')

    summary_rows = [
        ['Tổng số test cases', len(TEST_CASES)],
        ['Số test thành công', 'Cập nhật sau khi chạy Jest'],
        ['Số test thất bại', 'Cập nhật sau khi chạy Jest'],
        ['Số test pending', 0],
        ['Ảnh chụp màn hình', 'Chưa tạo được screenshot tự động trong môi trường này; dùng log test và coverage HTML làm bằng chứng thay thế'],
        ['Log chạy test', 'Xem output của lệnh Jest trong terminal hoặc file log nếu lưu riêng'],
    ]

    current_row = 4
    for key, value in summary_rows:
        sheet.cell(current_row, 1, key)
        sheet.cell(current_row, 2, value)
        style_body(sheet.cell(current_row, 1), wrap=False)
        style_body(sheet.cell(current_row, 2))
        current_row += 1

    current_row += 1
    sheet.cell(current_row, 1, 'Kết quả coverage tổng hợp')
    style_header(sheet.cell(current_row, 1))
    total_counts = get_total_counts(coverage_summary)
    coverage_headers = ['Chỉ số', 'Tỷ lệ %']
    coverage_rows = [
        ['Statements', total_counts['statements']],
        ['Branches', total_counts['branches']],
        ['Functions', total_counts['functions']],
        ['Lines', total_counts['lines']],
    ]
    write_table(sheet, current_row + 1, coverage_headers, coverage_rows)
    autofit_columns(sheet)


def write_coverage_sheet(workbook: Workbook, coverage_summary: dict[str, Any] | None) -> None:
    sheet = workbook.create_sheet('Coverage')
    add_title(sheet, 'Báo cáo độ phủ mã', 'Dữ liệu lấy từ coverage-summary.json nếu có')

    if not coverage_summary:
        sheet['A4'] = 'Chưa có coverage-summary.json. Hãy chạy Jest với --coverageReporters=json-summary trước.'
        style_body(sheet['A4'])
        autofit_columns(sheet)
        return

    total = coverage_summary.get('total', {})
    headers = ['Chỉ số', 'Tỷ lệ %', 'Tổng số', 'Đã bao phủ']
    rows = []
    for metric_name in ('statements', 'branches', 'functions', 'lines'):
        metric = total.get(metric_name, {})
        rows.append([
            metric_name.capitalize(),
            metric.get('pct', 0.0),
            metric.get('total', 0),
            metric.get('covered', 0),
        ])

    current_row = write_table(sheet, 4, headers, rows)

    current_row += 2
    sheet.cell(current_row, 1, 'Coverage theo file')
    style_header(sheet.cell(current_row, 1))
    file_headers = ['File', 'Statements %', 'Branches %', 'Functions %', 'Lines %']
    file_rows = []
    for file_name, metrics in sorted(coverage_summary.items()):
        if file_name == 'total':
            continue
        if not isinstance(metrics, dict):
            continue
        file_rows.append([
            file_name,
            metrics.get('statements', {}).get('pct', 0.0),
            metrics.get('branches', {}).get('pct', 0.0),
            metrics.get('functions', {}).get('pct', 0.0),
            metrics.get('lines', {}).get('pct', 0.0),
        ])
    write_table(sheet, current_row + 1, file_headers, file_rows)
    autofit_columns(sheet)


def write_reference_sheet(workbook: Workbook) -> None:
    sheet = workbook.create_sheet('Tai_lieu_tham_khao')
    add_title(sheet, 'Tài liệu tham khảo')
    headers = ['Nguồn', 'Liên kết / Tài liệu']
    rows = [[name, value] for name, value in REFERENCES_ROWS]
    write_table(sheet, 4, headers, rows)
    autofit_columns(sheet)


def write_command_sheet(workbook: Workbook) -> None:
    sheet = workbook.create_sheet('Lenh_da_dung')
    add_title(sheet, 'Danh sách câu lệnh đã sử dụng')
    headers = ['STT', 'Lệnh']
    rows = [[index + 1, command] for index, command in enumerate(COMMAND_ROWS)]
    write_table(sheet, 4, headers, rows)
    autofit_columns(sheet)


def main() -> None:
    coverage_summary = load_coverage_summary()

    workbook = Workbook()
    write_overview_sheet(workbook)
    write_scope_sheet(workbook)
    write_test_case_sheet(workbook)
    write_execution_sheet(workbook, coverage_summary)
    write_coverage_sheet(workbook, coverage_summary)
    write_reference_sheet(workbook)
    write_command_sheet(workbook)

    workbook.save(OUTPUT_WORKBOOK)
    print(OUTPUT_WORKBOOK)


if __name__ == '__main__':
    main()
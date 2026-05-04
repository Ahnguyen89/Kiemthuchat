from copy import copy
from pathlib import Path
import sys

from openpyxl import load_workbook


ROOT = Path(__file__).resolve().parents[1]
SAMPLE_WORKBOOK = ROOT / "ADMIN-TESTCASE.xlsx"
OUTPUT_WORKBOOK = ROOT / "TESTCASE_THEO_DAC_TA.xlsx"
FALLBACK_WORKBOOK = ROOT / "TESTCASE_CANVAS_CHAT_AI.xlsx"


SECTIONS = [
    {
        "sheet_name": "Canvas_Workspace",
        "title": "Canvas Workspace",
        "group": "Chức năng Canvas Workspace",
        "prefix": "CWS",
        "cases": [
            ("Kiểm tra tạo canvas mới từ Blank", "Tại Dashboard Canvas, nhấn New Canvas, chọn Blank Canvas, nhập tên hợp lệ và nhấn Create", "Hệ thống tạo canvas mới và điều hướng vào màn hình làm việc", "Canvas được tạo thành công", "Pass", "Happy path"),
            ("Kiểm tra tạo canvas mới từ template", "Tại Dashboard Canvas, chọn một template như Brainstorming hoặc Flowchart rồi nhấn Create", "Canvas mới chứa sẵn cấu trúc/nodes theo template đã chọn", "Template được áp dụng đúng", "Pass", "Happy path"),
            ("Kiểm tra bắt buộc nhập tên canvas", "Tại hộp thoại tạo canvas, để trống tên canvas rồi nhấn Create", "Hệ thống không cho tạo và hiển thị thông báo lỗi phù hợp", "Validate hoạt động đúng", "Pass", "Validation"),
            ("Kiểm tra hiển thị danh sách canvas", "Mở trang Dashboard Canvas khi người dùng đã có nhiều canvas", "Hệ thống hiển thị đúng danh sách canvas, tên và preview/thông tin cơ bản", "Danh sách hiển thị đúng", "Pass", "Danh sách"),
            ("Kiểm tra tìm kiếm canvas", "Nhập từ khóa trùng một phần tên canvas vào ô tìm kiếm", "Danh sách chỉ còn các canvas phù hợp với từ khóa", "Tìm kiếm hoạt động đúng", "Pass", "Search"),
            ("Kiểm tra mở chi tiết canvas", "Từ danh sách canvas, chọn một canvas bất kỳ", "Hệ thống mở đúng canvas đã chọn với nội dung đã lưu", "Điều hướng đúng", "Pass", "Navigation"),
            ("Kiểm tra đổi tên canvas", "Mở một canvas, đổi tên rồi lưu", "Tên canvas được cập nhật ở màn hình chi tiết và ngoài danh sách", "Cập nhật thành công", "Pass", "Update"),
            ("Kiểm tra xóa canvas", "Từ dashboard, chọn Delete cho một canvas đã tồn tại", "Canvas bị xóa khỏi danh sách và không thể mở lại bằng id cũ", "Xóa thành công", "Pass", "Delete"),
            ("Kiểm tra duplicate canvas", "Từ dashboard, chọn Duplicate cho một canvas đã tồn tại", "Hệ thống tạo bản sao mới với nội dung giống bản gốc", "Nhân bản thành công", "Pass", "Chức năng quản lý"),
            ("Kiểm tra thêm Text Block", "Trong canvas, chọn công cụ Text Block để thêm node mới", "Node text được tạo và cho phép nhập/chỉnh sửa nội dung", "Node hoạt động đúng", "Pass", "Node type"),
            ("Kiểm tra thêm Sticky Note", "Trong canvas, chọn công cụ Sticky Note để thêm node mới", "Sticky note được tạo đúng vị trí mặc định và sửa được nội dung", "Node hoạt động đúng", "Pass", "Node type"),
            ("Kiểm tra đổi màu Sticky Note", "Chọn một sticky note rồi thay đổi màu", "Màu node được cập nhật đúng và vẫn được lưu sau khi reload", "Đổi màu thành công", "Pass", "Node formatting"),
            ("Kiểm tra thêm Task List", "Trong canvas, chọn Task List rồi thêm nhiều task con", "Task list hiển thị đúng tiêu đề, danh sách task và trạng thái", "Node hoạt động đúng", "Pass", "Node type"),
            ("Kiểm tra đánh dấu hoàn thành task", "Chọn một task trong task list và tick completed", "Task chuyển trạng thái hoàn thành, progress được cập nhật đúng", "Cập nhật đúng", "Pass", "Business rule"),
            ("Kiểm tra thêm Code Block", "Trong canvas, thêm node Code Block và nhập mã nguồn", "Code block hiển thị đúng nội dung và ngôn ngữ đã chọn", "Node hoạt động đúng", "Pass", "Node type"),
            ("Kiểm tra thêm Image bằng URL hợp lệ", "Trong canvas, thêm Image node với URL ảnh hợp lệ", "Ảnh được tải và hiển thị thành công", "Hiển thị đúng", "Pass", "Node type"),
            ("Kiểm tra thêm Image bằng URL lỗi", "Trong canvas, thêm Image node với URL không hợp lệ", "Hệ thống không crash và hiển thị trạng thái lỗi/phương án thay thế phù hợp", "Xử lý đúng", "Pass", "Error handling"),
            ("Kiểm tra thêm Shape", "Trong canvas, thêm một shape bất kỳ như rectangle hoặc diamond", "Shape được tạo đúng loại và có thể chỉnh text/màu", "Node hoạt động đúng", "Pass", "Node type"),
            ("Kiểm tra thêm Heading", "Trong canvas, thêm heading và đổi level", "Heading hiển thị đúng cấp độ và nội dung", "Node hoạt động đúng", "Pass", "Node type"),
            ("Kiểm tra kéo thả reposition node", "Tạo một node rồi kéo sang vị trí khác", "Node di chuyển đúng theo thao tác kéo thả", "Drag-drop hoạt động đúng", "Pass", "Interaction"),
            ("Kiểm tra nối 2 node bằng edge", "Tạo 2 node rồi kéo connection handle để nối", "Hệ thống tạo edge kết nối đúng giữa 2 node", "Connection hoạt động đúng", "Pass", "Interaction"),
            ("Kiểm tra xóa node", "Chọn một node đã tạo rồi thực hiện Delete", "Node bị xóa khỏi canvas và edge liên quan được xử lý phù hợp", "Xóa thành công", "Pass", "Delete"),
            ("Kiểm tra xóa edge", "Chọn một edge đã tạo rồi thực hiện Delete", "Edge bị xóa và các node vẫn giữ nguyên", "Xóa thành công", "Pass", "Delete"),
            ("Kiểm tra save canvas", "Tạo/chỉnh sửa nhiều node rồi nhấn Save", "Hệ thống lưu thành công, hiển thị trạng thái lưu phù hợp", "Lưu thành công", "Pass", "Persistence"),
            ("Kiểm tra dữ liệu sau reload", "Sau khi Save, refresh trình duyệt hoặc mở lại canvas", "Toàn bộ node, edge và nội dung vừa lưu được khôi phục đúng", "Dữ liệu được lưu bền vững", "Pass", "Persistence"),
            ("Kiểm tra export PNG", "Mở canvas đã có dữ liệu rồi chọn Export as PNG", "Hệ thống sinh file PNG với nội dung canvas tương ứng", "Xuất file thành công", "Pass", "Export"),
            ("Kiểm tra export JSON", "Mở canvas đã có dữ liệu rồi chọn Export as JSON", "Hệ thống sinh file JSON đúng cấu trúc canvas", "Xuất file thành công", "Pass", "Export"),
            ("Kiểm tra import JSON hợp lệ", "Chọn Import from JSON với file export hợp lệ", "Canvas được khôi phục đúng theo dữ liệu file", "Import thành công", "Pass", "Import"),
            ("Kiểm tra import JSON không hợp lệ", "Chọn Import from JSON với file sai cấu trúc", "Hệ thống từ chối import và hiển thị lỗi phù hợp", "Xử lý đúng", "Pass", "Import validation"),
            ("Kiểm tra AI Assistant suggestions xuất hiện theo ngữ cảnh", "Mở canvas có nội dung phù hợp để phát sinh suggestions", "Panel AI suggestions xuất hiện với gợi ý phù hợp nội dung", "Hiển thị đúng", "Pass", "AI assist trong workspace"),
            ("Kiểm tra chia sẻ canvas quyền VIEW", "Tạo share link quyền VIEW rồi mở bằng tài khoản khác", "Người nhận xem được canvas nhưng không chỉnh sửa/lưu được", "Phân quyền đúng", "Pass", "Permission"),
            ("Kiểm tra chia sẻ canvas quyền EDIT", "Tạo share link quyền EDIT rồi mở bằng tài khoản khác", "Người nhận chỉnh sửa và lưu thay đổi được", "Phân quyền đúng", "Pass", "Permission"),
            ("Kiểm tra đồng bộ shared canvas sau khi người khác lưu", "Hai người cùng mở shared canvas, một người lưu thay đổi", "Người còn lại nhận được cập nhật canvas:saved và thấy dữ liệu mới", "Realtime sync đúng", "Pass", "Realtime"),
        ],
    },
    {
        "sheet_name": "Chat",
        "title": "Chat",
        "group": "Chức năng Chat",
        "prefix": "CHAT",
        "cases": [
            ("Kiểm tra tạo phòng chat 1-1", "Chọn một người dùng và bắt đầu cuộc trò chuyện riêng", "Hệ thống tạo hoặc mở đúng phòng chat 1-1", "Khởi tạo đúng", "Pass", "Happy path"),
            ("Kiểm tra gửi tin nhắn văn bản trong chat 1-1", "Nhập nội dung tin nhắn hợp lệ rồi nhấn Send", "Tin nhắn được gửi thành công và hiển thị trong khung chat", "Gửi thành công", "Pass", "Happy path"),
            ("Kiểm tra không cho gửi tin nhắn rỗng", "Để trống nội dung tin nhắn rồi nhấn Send", "Hệ thống không gửi tin và hiển thị/giữ trạng thái phù hợp", "Validate đúng", "Pass", "Validation"),
            ("Kiểm tra nhận tin nhắn realtime ở người nhận", "Người A gửi tin nhắn cho người B đang online", "Người B nhận được tin nhắn gần thời gian thực không cần refresh", "Realtime đúng", "Pass", "Realtime"),
            ("Kiểm tra hiển thị lịch sử chat 1-1", "Mở lại phòng chat đã có tin nhắn trước đó", "Hệ thống tải và hiển thị đúng lịch sử tin nhắn cũ", "Hiển thị đúng", "Pass", "Persistence"),
            ("Kiểm tra tạo nhóm chat", "Tạo một phòng chat nhóm với nhiều thành viên", "Nhóm chat được tạo thành công và hiện trong danh sách", "Tạo thành công", "Pass", "Happy path"),
            ("Kiểm tra thêm thành viên vào nhóm chat", "Mở nhóm chat và thêm một thành viên mới", "Thành viên được thêm vào nhóm thành công", "Cập nhật đúng", "Pass", "Quản lý nhóm"),
            ("Kiểm tra gửi tin nhắn trong nhóm", "Một thành viên gửi tin trong nhóm", "Tất cả thành viên online trong nhóm nhận được tin nhắn", "Realtime đúng", "Pass", "Realtime"),
            ("Kiểm tra hiển thị trạng thái online", "Mở danh sách chat/nhóm khi thành viên đang online và offline", "Hệ thống hiển thị đúng trạng thái online của từng người", "Hiển thị đúng", "Pass", "Presence"),
            ("Kiểm tra chuyển đổi giữa các phòng chat", "Liên tục chọn qua lại nhiều phòng chat khác nhau", "Khung chat tải đúng nội dung theo phòng đang chọn, không lẫn dữ liệu", "Điều hướng đúng", "Pass", "Navigation"),
            ("Kiểm tra tạo canvas mới từ trang chat", "Tại trang chat, nhấn tạo canvas mới", "Hệ thống tạo canvas mới và cập nhật query flow trên URL", "Tạo thành công", "Pass", "Tích hợp chat-canvas"),
            ("Kiểm tra mở canvas theo flow trên trang chat", "Truy cập /dashboard/chat?flow={id} với flow hợp lệ", "Trang chat tải đúng canvas tương ứng", "Hiển thị đúng", "Pass", "Tích hợp chat-canvas"),
            ("Kiểm tra lỗi khi flow không tồn tại ở trang chat", "Truy cập trang chat với flow id không hợp lệ", "Hệ thống hiển thị thông báo lỗi phù hợp, không crash", "Xử lý đúng", "Pass", "Error handling"),
        ],
    },
    {
        "sheet_name": "AI",
        "title": "AI",
        "group": "Chức năng AI",
        "prefix": "AI",
        "cases": [
            ("Kiểm tra mở AI Canvas Dialog", "Mở một canvas không ở chế độ read-only rồi nhấn nút AI", "Hệ thống mở AI dialog thành công", "Mở đúng", "Pass", "Happy path"),
            ("Kiểm tra summarize canvas với dữ liệu hợp lệ", "Mở canvas có nhiều node nội dung rồi chọn Summarize Canvas", "Hệ thống trả về bản tóm tắt phản ánh đúng nội dung canvas", "Tóm tắt đúng ngữ cảnh", "Pass", "Summarization"),
            ("Kiểm tra hỏi đáp về canvas với câu hỏi hợp lệ", "Nhập câu hỏi liên quan nội dung canvas rồi gửi", "Hệ thống trả lời đúng ngữ cảnh dựa trên dữ liệu canvas hiện tại", "Trả lời đúng", "Pass", "Q&A"),
            ("Kiểm tra dùng suggested question", "Mở AI dialog và chọn một câu hỏi gợi ý", "Hệ thống tự điền/gửi câu hỏi gợi ý và trả lời tương ứng", "Hoạt động đúng", "Pass", "Usability"),
            ("Kiểm tra không cho gửi câu hỏi rỗng", "Để trống ô câu hỏi rồi nhấn gửi", "Hệ thống không gửi request và hiển thị trạng thái phù hợp", "Validate đúng", "Pass", "Validation"),
            ("Kiểm tra conversation history trong AI dialog", "Thực hiện liên tiếp nhiều lượt hỏi đáp trong cùng phiên", "Lịch sử hội thoại trong dialog được giữ lại đúng thứ tự", "Hiển thị đúng", "Pass", "Session behavior"),
            ("Kiểm tra streaming câu trả lời", "Gửi một câu hỏi hợp lệ đến LLM hỗ trợ streaming", "Câu trả lời hiển thị dần theo thời gian thực thay vì chờ hoàn tất toàn bộ", "Streaming đúng", "Pass", "Streaming"),
            ("Kiểm tra xử lý canvas rỗng với AI", "Mở AI dialog trên canvas rỗng rồi chọn summarize hoặc hỏi đáp", "Hệ thống phản hồi phù hợp rằng canvas chưa có đủ nội dung", "Xử lý đúng", "Pass", "Boundary"),
            ("Kiểm tra AI suggestions cho canvas rỗng", "Mở một canvas rỗng và chờ AI suggestions", "Hệ thống gợi ý template hoặc hành động khởi tạo phù hợp", "Gợi ý đúng", "Pass", "Suggestion"),
            ("Kiểm tra AI suggestions cho node rời rạc", "Tạo nhiều node chưa kết nối rồi chờ phân tích", "Hệ thống gợi ý kết nối hoặc tổ chức lại nội dung", "Gợi ý đúng", "Pass", "Suggestion"),
            ("Kiểm tra AI generate canvas từ prompt hợp lệ", "Nhập prompt hợp lệ ở chức năng AI generate canvas", "Hệ thống tạo ra canvas có cấu trúc tương ứng với prompt", "Tạo sinh đúng", "Pass", "Generation"),
            ("Kiểm tra AI generate với prompt rỗng", "Để trống prompt ở chức năng tạo sinh rồi nhấn gửi", "Hệ thống không xử lý và cảnh báo chưa nhập mô tả", "Validate đúng", "Pass", "Validation"),
            ("Kiểm tra trả lỗi khi chưa cấu hình API key", "Gọi summarize/ask/generate khi không có API key hợp lệ", "Hệ thống trả thông báo lỗi rõ ràng về cấu hình API key", "Xử lý đúng", "Pass", "Configuration error"),
            ("Kiểm tra ưu tiên user API key hơn system API key", "Cấu hình cả system key và user key hợp lệ rồi gọi AI", "Hệ thống sử dụng user key theo ưu tiên thiết kế", "Xử lý đúng", "Pass", "Business rule"),
            ("Kiểm tra generate embeddings", "Gọi chức năng generate embeddings trên canvas có dữ liệu", "Hệ thống trả về mảng embeddings và dimension hợp lệ", "Sinh embeddings thành công", "Pass", "API behavior"),
            ("Kiểm tra giới hạn context với canvas lớn", "Dùng canvas có nội dung rất dài rồi gọi summarize", "Hệ thống vẫn phản hồi được, có cơ chế cắt ngữ cảnh hợp lý và không crash", "Xử lý đúng", "Pass", "Scalability"),
            ("Kiểm tra xử lý lỗi từ nhà cung cấp LLM", "Mô phỏng OpenAI/provider timeout hoặc lỗi 5xx khi hỏi đáp", "Hệ thống hiển thị lỗi phù hợp và không làm treo giao diện", "Xử lý đúng", "Pass", "Error handling"),
        ],
    },
]


def copy_row_style(source_ws, target_ws, source_row, target_row):
    for col in range(1, 9):
        source = source_ws.cell(source_row, col)
        target = target_ws.cell(target_row, col)
        if source.has_style:
            target._style = copy(source._style)
        target.font = copy(source.font)
        target.fill = copy(source.fill)
        target.border = copy(source.border)
        target.alignment = copy(source.alignment)
        target.protection = copy(source.protection)
        target.number_format = source.number_format


def populate_sheet(template_ws, ws, section):
    ws["A2"] = section["title"]
    ws["B5"] = section["group"]

    for idx, case in enumerate(section["cases"], start=1):
        row = 5 + idx
        copy_row_style(template_ws, ws, 6, row)
        purpose, steps, expected, actual, status, note = case
        ws[f"A{row}"] = idx
        ws[f"B{row}"] = f"{section['prefix']}_{idx}"
        ws[f"C{row}"] = purpose
        ws[f"D{row}"] = steps
        ws[f"E{row}"] = expected
        ws[f"F{row}"] = actual
        ws[f"G{row}"] = status
        ws[f"H{row}"] = note


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    wb = load_workbook(SAMPLE_WORKBOOK)

    for sheet_name in wb.sheetnames[1:]:
        del wb[sheet_name]

    template_ws = wb[wb.sheetnames[0]]
    template_ws.title = SECTIONS[0]["sheet_name"]

    for section in SECTIONS[1:]:
        ws = wb.copy_worksheet(template_ws)
        ws.title = section["sheet_name"]

    for section in SECTIONS:
        populate_sheet(template_ws, wb[section["sheet_name"]], section)

    output_path = OUTPUT_WORKBOOK
    try:
        wb.save(output_path)
    except PermissionError:
        output_path = FALLBACK_WORKBOOK
        wb.save(output_path)

    print(output_path)


if __name__ == "__main__":
    main()

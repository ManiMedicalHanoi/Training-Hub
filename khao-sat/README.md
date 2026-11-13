# Kết quả khảo sát · MMH

https://manimedicalhanoi.github.io/Training-Hub/khao-sat/

Xem kết quả mọi khảo sát Google Form của MMH: danh sách khảo sát (thêm bằng link sửa form hoặc link Sheet kết quả) ⇒ thống kê từng câu hỏi (số người, %),
lọc theo phần / theo câu trả lời, từng câu trả lời, tải bảng thống kê (CSV). Câu trả lời mới: số trên chuông + thông báo trình duyệt khi đang mở app,
và mục "Nhắc tôi" của Report Hub / CRM cho người bấm **Theo dõi** (máy chủ quét mỗi giờ 7h–21h, T2–T7).

- Đăng nhập: email công ty + mật khẩu hoặc mã 6 số (Training Hub `rhAuth*`), dùng chung phiên `mmh_tk` với Report Hub / CRM / Tender Map.
- Máy chủ: web app `survey` — kho riêng tư `ManiMedicalHanoi/mmh-backend` ▸ `backends/survey/MMH_SurveyResults.gs` (`rsList` · `rsAdd` · `rsData` · `rsWatch` · `rsRemove` · `rsTick`).
- Dữ liệu đọc bằng tài khoản chạy máy chủ (mmh.product@manimedicalhanoi.com) ⇒ form / Sheet của người khác phải chia sẻ quyền Người xem cho tài khoản này.
- Họ tên / số điện thoại / email người trả lời chỉ trả cho Admin / Giám đốc / Trưởng bộ phận và người thêm khảo sát. Không có dữ liệu khảo sát nào lưu trong kho này.

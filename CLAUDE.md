# MMH Training Hub — quy tắc làm việc cho Claude

Ứng dụng: `index.html` (GitHub Pages từ nhánh `main`). Người dùng là nhân sự MANI Medical Hanoi — **trả lời và viết nội
dung bằng tiếng Việt**, câu ngắn, kiểu *bấm vào đâu → làm gì → kết quả*. Quy trình chung: skill **gh-webapp-upgrader**.

## BẮT BUỘC sau MỖI thay đổi người dùng nhìn thấy (cùng PR)
1. Tăng `APP_VERSION` trong `index.html` và tham số cache `updates/notes.js?v=X.Y`.
2. Thêm mục lên ĐẦU `window.APP_UPDATES` (`updates/notes.js`): id `YYYY-MM-DD-vX.Y`, title chữ thuần, items
   `{type:"new"|"imp"|"fix", title, text, img}` (icon SVG tự theo `type`, không dùng emoji). Ảnh thật (dữ liệu giả) ở `updates/vX.Y/`.
   Thông báo tự hiện 1 lần / người trong 7 ngày, sau khi đồng bộ xong và không có hộp thoại khác; xem lại: menu tài khoản ▸ "Có gì mới".
3. Kiểm thử: `python3 tools/check_scripts.py index.html` + `python3 tools/design_lint.py index.html` (không còn LỖI) +
   ảnh 1440 px / 390 px bằng `tools/shots.js` (máy chủ giả lập: dữ liệu giả `ifu/capture/th/fixtures.js` của kho `ManiMedicalHanoi/mmh-backend`, biến `TH_BACKEND`;
   cách chạy ghi ở đầu file). `script.google.com` bị chặn trong môi trường Claude — không gọi được backend thật.

## Giao diện
- Theo `DESIGN.md` (màu `--h-*`, Lexend, màu nhóm khoá học, danh sách "Không dùng").
- Vá theo lớp: khối `<style id="vXY-css">` / `<script id="vXY-js">` mới ở cuối file, ghi chú phiên bản + mục đích; bọc hàm cũ
  (`const _f = A.x; A.x = function(){ … return _f.apply(this, arguments); }`).

## Backend
- Apps Script "Training Hub" (`backends/training/` trong kho riêng tư `ManiMedicalHanoi/mmh-backend`, dùng chung với
  MMH-Report). Sửa backend ⇒ PR ở kho đó, GitHub Actions tự deploy; gộp backend TRƯỚC frontend. Không bắt người dùng dán `.gs`.
- `window.MIN_SERVER`: bản backend tối thiểu app cần; thấp hơn ⇒ dải cảnh báo đầu trang (Admin thấy thêm hướng dẫn).

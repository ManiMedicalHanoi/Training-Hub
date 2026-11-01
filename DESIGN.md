# MMH Training Hub · hướng thiết kế (đọc trước khi sửa giao diện)

<!-- Theo skill gh-webapp-upgrader ▸ references/design-quality.md. Mỗi dòng là lựa chọn RIÊNG của app này. -->

**Thế giới:** phòng đào tạo sản phẩm MANI: hộp dụng cụ thật chụp trên nền trắng, catalogue, slide bài giảng, chứng chỉ
giấy. Motif **đường khâu** (suture) cho tiến độ học. Ảnh bìa ưu tiên ảnh thật: ảnh riêng của khoá > ảnh video > ảnh
sản phẩm (khoá nhóm Sản phẩm) > ảnh nhóm (Admin ▸ Giao diện) > bìa phẳng theo nhóm.

**Người dùng:** Sales Rep, Marketing, Back Office của MMH; học trên **điện thoại giữa hai lần thăm khách**, trainer và
Admin quản lý trên máy tính. Việc làm nhiều nhất: mở tiếp bài đang học ⇒ trang chủ đặt "Việc của tôi" ngay dưới phần đầu.

**Màu** (biến `--h-*` trong `:root` của khối v4):
| Tên | Hex | Dùng cho |
|---|---|---|
| Mực | `#003047` | tiêu đề, nút chính tối, phần đầu trang |
| Nhấn | `#3A5CAA` | link, tab đang chọn, thanh tiến độ |
| Viền nhấn | `#CFE2F3` | viền ô chọn, nền nhấn nhạt |
| Nền | `#F4F7FB` | nền trang; thẻ trắng viền `#E3E8EF` |
| Vàng MANI | `#FFE100` | chỉ "việc cần làm": nút Làm bài kiểm tra, huy chương chứng chỉ, logo |
Màu nhóm khoá học (cố định, mang nghĩa): Sản phẩm `#5698C1` · SOP `#6F9A2E` · Compliance `#C86A68` · Kỹ năng `#C98F00`.
Bìa khoá không có ảnh = nền 13 % màu nhóm + hình nét theo nhóm (`KN_ICON`: bảng kiểm, người thuyết trình, khiên).

**Chữ:** Lexend cho giao diện v4 (Be Vietnam Pro / Aptos dự phòng). Nhãn nhỏ viết hoa kiểu câu, không giãn chữ.
Số liệu `tabular-nums`. Bo góc: 8–10 ô nhập/chip · 14 thẻ · 20 hộp thoại/phần đầu.

**Chi tiết làm nên bản sắc:** ảnh sản phẩm MANI thật trên thẻ khoá học + đường khâu cho tiến độ.

**Chuyển động:** một khoảnh khắc chính ở phần đầu trang chủ (trình chiếu ảnh / video thương hiệu); còn lại chỉ phản hồi
thao tác, 150–250 ms. Luôn tôn trọng `prefers-reduced-motion`.

**Không dùng:** gradient trang trí (chỉ giữ lớp phủ che ảnh cho chữ dễ đọc, khung xương đang tải, huy chương), emoji
làm icon (dùng `ic()` – bộ nét `ICON`), nhãn IN HOA giãn chữ, bong bóng chat / hình 3D chung chung, mũi tên `→` sau chữ
link, chèn thêm phần tử vào thanh trên cùng (đã chật: menu Admin xuống dòng ở 1440 px). Mục mới cho người dùng ⇒ menu
tài khoản (`A.v4Menu`).

**Soát trước khi phát hành:** `python3 tools/design_lint.py index.html` (không còn mức LỖI) + ảnh 1440 px và 390 px
bằng `tools/shots.js`.

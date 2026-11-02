# Bàn giao phiên Claude — Training Hub v6.5 đang dở (02/11/2026)

Đọc file này trước, rồi `CLAUDE.md`, `DESIGN.md` của repo. Trả lời người dùng bằng tiếng Việt. Quy trình chung: skill **gh-webapp-upgrader**.

## 1. Trạng thái hiện tại

| Kho | Nhánh | Trạng thái |
|---|---|---|
| `ManiMedicalHanoi/Training-Hub` | `main` | **v6.4 đang chạy thật** (PWA cài được). v6.3 (#25), v6.4 (#26) đã gộp. |
| `ManiMedicalHanoi/Training-Hub` | `ccr-19f5b594-7qmqk8` | **WIP v6.5** (commit "WIP Training Hub v6.5"), CHƯA gộp, CHƯA phát hành. |
| `ManiMedicalHanoi/mmh-library` | `main` | Skill `skills/gh-webapp-upgrader.skill` bản mới đã gộp (#22). |
| `ManiMedicalHanoi/mmh-backend` | `main` | Chưa sửa gì trong phiên này. |

Người dùng còn phải tự làm: tải `skills/gh-webapp-upgrader.skill` (kho mmh-library) lên Claude ▸ Settings ▸ Skills (skill do tổ chức quản lý ⇒ có thể cần admin tổ chức).

## 2. Yêu cầu của người dùng (02/11/2026) — 4 mục, kèm ảnh chụp app cài trên Windows (~1500–1900 px)

1. **Màn hình rộng**: hai bên trống nhiều; phần đầu trang chủ (hero) co lại, chữ đè ảnh / nút; menu trên xuống dòng (Admin có "Quản lý").
2. **Lộ trình**: "Nha khoa" phải nằm trong **Kiến thức y khoa**; **Sản phẩm** chia thư mục **Nha khoa / Nhãn khoa / Ngoại khoa** — thêm 1 lớp.
3. **Video**: chưa xem đủ **70% lần đầu** thì **không được tua nhanh / bỏ qua**; xem đủ rồi mới tự do.
4. **Tài liệu PDF/PPT** mở qua Hub hay lỗi (lưu trên Drive), hệ thống không biết thế nào là "xem hết". Đề xuất 2 luồng: (a) vẫn lưu Drive để xem / tải; (b) đưa lên **GitHub** để xem trong app dạng **trình chiếu slide**, vẫn luật **xem ≥ 70% số trang** mới tính.

## 3. Đã làm trên nhánh WIP (index.html; APP_VERSION = '6.5', `notes.js?v=6.5`)

### Mục 1 — XONG, đã chụp kiểm (1100 / 1366 / 1440 / 1600 / 1890 px)
- Nguyên nhân: hero nằm trong `.v4-wrap` (max 1320) nhưng vị trí chữ / ảnh / nút tính theo `calc((100vw - 1320px)/2 + 24px)` ⇒ màn rộng bị đẩy vào giữa.
- Sửa: mọi `max-width:1320px` ⇒ `var(--wrapw,1320px)`; `--wrapw` = 1520 px (≥1600), 1680 px (≥1900) trong `<style id="v65-css">`.
  `.v55-cap/.v55-ui/.v55-sl .fr/.v55-cr` dùng `clamp(24px,3.6vw,64px)` và % theo khung hero. `.v4-nav` `flex-wrap:nowrap`; ô tìm co lại, ≤1365 px chỉ còn icon.

### Mục 2 — CODE XONG, đã chụp kiểm trang Lộ trình; CHƯA kiểm form
- Trong khối v4 (tìm `★ v6.5 (02/11/2026) — HAI LỚP NHÓM`): `topOf(s)` = `P` (Sản phẩm) / `K` (Kiến thức y khoa) / `C:<nhóm chủ đề>`; `subOf(s)` = `nha|nhan|ngoai|mmg|other`; `topSeg()`, `foldRow()`, `inGrp()`. Trang chủ (`H.sub`) và `#/learn` (`F4.sub`) có hàng thư mục `.v65-fold` khi chọn P/K. Tiêu đề trang chủ đổi "Lộ trình sản phẩm" ⇒ "Lộ trình học". `window.V4` export thêm `topOf, subOf, FOLD`.
- **KHÔNG đổi Nhóm chủ đề (category)** vì KPI đào tạo (`mmh-backend/backends/training/Kết nối KPI.gs`) đếm theo category Product. Phân lớp dựa vào `S.smeta[sid].line`:
  - `"Sản phẩm · Nha khoa"` ⇒ Sản phẩm ▸ Nha khoa; `"Kiến thức y khoa · Nhãn khoa"` ⇒ Kiến thức y khoa ▸ Nhãn khoa.
  - Dữ liệu cũ: line đúng `Nha khoa` / `Nhãn khoa` / `Ngoại khoa` ⇒ **Kiến thức y khoa** (theo ý người dùng); line trống ⇒ Sản phẩm, thư mục đoán theo tên + mục tiêu (`SUB_RE`, so nguyên từ; thứ tự MMG → nhãn → ngoại → nha).
- Form tạo / sửa khoá (`v65-js`, bọc `sessionForm`): ô gõ "Nhóm sản phẩm" ẩn, thay bằng 2 ô chọn **Loại nội dung** + **Chuyên khoa**, ghi vào `#sfLine` ⇒ lưu như cũ. **Cần chụp kiểm form.**
- Lưu ý: ảnh bìa theo nhóm của Admin dùng `grpKey` = `'L:' + line` ⇒ line mới ("Sản phẩm · Nha khoa") không khớp key ảnh bìa cũ "L:Nha khoa". Cân nhắc map lại trong `grpKey` hoặc báo người dùng.

### Mục 3 — CODE XONG, CHƯA kiểm thử chạy
- 2 trình phát HTML5 (khối VP ~dòng 3990 và trình phát trên trang khoá ~dòng 5294): chưa đạt 70% ⇒ `playbackRate` tối đa **1x** (trước 2x); chặn tua vượt `reach + 3s` đã có sẵn; nút "Tiếp tục" đã khoá sẵn khi chưa xong.
- **Lỗ hổng thật**: video nằm trên **Google Drive** (kind `video`, không có `src` HTML5) mở bằng iframe Drive (tua / tăng tốc tự do), trước đây được tính xong sau 20 giây (lộ trình) hoặc ngay khi mở (tab Tài liệu). `v65-js` đã:
  - bỏ nút "Đã xem xong" cho video Drive (bọc `Course.foot`, chặn `A.crsMark`); mở ngoài lộ trình không còn tính xong;
  - trainer có nút **"Đưa lên trình phát Hub"** (`A.v65pub` ⇒ `post('videoPublish', {sid, fileId, title, duration:0})` — action backend có sẵn, giới hạn **25 MB** `HUB_GH.MAX_MB`);
  - bọc `matsFrom`: ẩn bản Drive khi đã có video Hub cùng `catalogId = 'drive:<fileId>'`.
- Hệ quả cần báo người dùng: khoá có video Drive chưa chuyển ⇒ học viên **không hoàn thành được** cho tới khi trainer bấm chuyển. Video > 25 MB phải nén (720p) trước.

### Mục 4 — CHƯA LÀM (cần người dùng quyết định trước)
- Backend đã có sẵn đẩy file lên GitHub: `hubGhPut_` (`mmh-backend/backends/training/RH_HubCourse.gs`), token `HUB_GH_TOKEN`, kho đích `Training-Hub`, thư mục `media/s/<sid>/`.
- Thiết kế đề xuất:
  1. Backend thêm action `docPublish` (trainer của khoá): Drive file ⇒ PDF (PPTX / Google Slides / DOCX chuyển qua Drive; dùng lại logic `apiFileConvert`) ⇒ `hubGhPut_('media/s/<sid>/D<id>.pdf')` ⇒ ghi sheet/Property map `fileId → url`; `listMaterials` trả thêm `gh` cho file đã đăng.
  2. Frontend: có `f.gh` ⇒ mở bằng pdf.js từ GitHub Pages (cùng nguồn, không lỗi quyền Drive) ở **chế độ trình chiếu** (1 slide / màn, nút trước–sau, toàn màn hình); tính xong khi xem **≥ 70% số trang** (Reader đã đếm trang với PDF). Nút trainer "Đăng bản xem trên app" + "Đăng tất cả tài liệu". Không có `gh` ⇒ luồng Drive như cũ, **bỏ tính xong sau 30 giây** của trình xem Google.
  3. Backend sửa ở kho `mmh-backend` (cần `add_repo` quyền push), PR + Deploy xanh **trước**, rồi mới gộp frontend.
- **Phải hỏi người dùng trước khi làm**: kho `Training-Hub` là **public** ⇒ PDF đẩy lên đó ai cũng tải được (video hiện cũng vậy). Tài liệu MANI có bản quyền / nội bộ. Hỏi: chấp nhận public, hay chỉ đăng tài liệu không mật, hay tìm chỗ lưu riêng tư.

## 4. Việc tiếp theo cho phiên mới (theo thứ tự)
1. `git checkout ccr-19f5b594-7qmqk8` trong Training-Hub (nhánh đã nối lịch sử cũ ⇒ push thường, không cần force).
2. Kiểm thử mục 2 (form) và mục 3 (video HTML5: tua / tốc độ; video Drive: footer, nút trainer, `crsMark`) bằng `tools/shots.js` + Playwright với máy chủ giả lập (cách chạy ở đầu `tools/shots.js`; cần kho mmh-backend tại `/home/user/manimedicalhanoi/mmh-backend` hoặc biến `TH_BACKEND`; `python3 -m http.server 8765` trong thư mục repo).
3. Thêm mục v6.5 lên ĐẦU `updates/notes.js` (+ ảnh `updates/v6.5/`): màn hình rộng, Lộ trình 2 lớp, khoá tua video, video Drive cần trainer chuyển.
4. `python3 tools/check_scripts.py index.html` + `python3 tools/design_lint.py index.html` (hiện 0 lỗi) + `node tools/pwa_check.js`.
5. Báo người dùng và **hỏi trước khi gộp** `main` (app thật cho toàn công ty). PR theo lệ cũ: squash, tiêu đề "Training Hub v6.5: …".
6. Hỏi người dùng quyết định mục 4 (public GitHub), rồi làm backend + frontend như mục 3.4 ở trên.

## 5. Việc nhỏ còn treo
- Hướng dẫn cài trên iPhone trong app (`v64-js`, hàm `guide()`) chưa nhắc **iOS 26**: nút Chia sẻ nằm trong nút **•••**. File PDF HDSD đã có ghi chú này.
- PDF HDSD cài app (`20261102_MMH_HDSD_Cai_Training_Hub.pdf`, đã gửi người dùng) chưa đưa vào repo / chưa gắn vào thông báo "Có gì mới v6.4". Hình Chrome / Safari trong PDF là hình **minh hoạ**; người dùng có thể gửi ảnh chụp thật để thay.
- MMH Wiki (mmh-library `wiki/`): các đề xuất từ bản đánh giá chưa làm — lỗi cache ảnh trong `wiki/public/sw.js` (ảnh lưu đệm vĩnh viễn, `V` không đổi), dựng thử khi có PR, quyết định công khai GitHub Pages với tài liệu bản quyền MANI.

## 6. Lưu ý kỹ thuật
- Môi trường Claude chặn `script.google.com` ⇒ không gọi được backend thật; kiểm thử bằng dữ liệu giả `mmh-backend/ifu/capture/th/fixtures.js` (module ES ⇒ `tools/shots.js` tự chép sang `.cjs`; fixture ghi bản máy chủ cũ ⇒ harness đặt `_v = '9.99'`).
- Push ép (force) bị chặn trong phiên Claude ⇒ khi nhánh đã gộp bằng squash, nối nhánh cũ bằng `git merge -s ours origin/<nhánh>` rồi push thường.
- `pkill -f "http.server"` trong cùng lệnh Bash làm lệnh bị ngắt (exit 144) — dừng máy chủ thử bằng lệnh riêng.

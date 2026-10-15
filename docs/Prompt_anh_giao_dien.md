# Prompt tạo ảnh cho giao diện Training Hub v4.0

App **đã chạy đầy đủ khi chưa có ảnh**: dùng nền gradient xanh và hình vẽ 3D. Ảnh dưới đây chỉ giúp thẻ khoá học đẹp hơn.

**Quy cách chung:** ảnh JPG ngang **1600 × 900 px (16:9)**, nền tối navy, không có chữ hay logo trong ảnh, mỗi ảnh dưới 300 KB.

**Đặt tên khi gửi lại:**

| Tên file | Dùng cho |
|---|---|
| `cover-nha.jpg` | Khoá Nha khoa |
| `cover-nhan.jpg` | Khoá Nhãn khoa |
| `cover-ngoai.jpg` | Khoá Ngoại khoa |
| `cover-kn.jpg` | Khoá Kỹ năng & quy trình |

Gửi file cho Claude: Claude sẽ đưa vào thư mục `media/ui/` và khai báo trong `media/catalog.json` ▸ `ui`.

Thẻ khoá học có video thì tự dùng ảnh bìa của video, không cần ảnh ở đây.

---

## 1. Nha khoa — `cover-nha.jpg`

```
Studio product render of a dental diamond bur and a NiTi rotary endodontic file floating diagonally,
photorealistic 3D, brushed stainless steel shank, golden diamond-grit head with fine sparkle,
deep navy background (#003047) with soft royal-blue radial glow (#3A5CAA) behind the instrument,
subtle thin elliptical orbit lines in light blue, cinematic rim light, shallow depth of field,
clean premium medical-device advertising style, generous empty space on the left for text,
no text, no logo, no hands, 16:9, 1600x900
```

## 2. Nhãn khoa — `cover-nhan.jpg`

```
Photorealistic 3D render of a human eyeball in three-quarter view with a clear cornea and a detailed
blue-teal iris, beside a slim ophthalmic micro-surgical knife (keratome) with a polished steel blade,
both floating on a deep navy background (#003047), soft cyan rim light, gentle blue glow,
medical-education illustration quality, clinical and elegant, not gory, no blood,
empty space on the left, no text, no logo, 16:9, 1600x900
```

## 3. Ngoại khoa — `cover-ngoai.jpg`

```
Premium 3D product render of a disposable skin stapler (surgical skin closure device) in white and blue
with a row of fine stainless-steel staples and a curved surgical suture needle with thread,
floating on a deep navy background (#003047) with soft royal-blue glow (#3A5CAA), studio lighting,
crisp reflections, clean hospital-tech aesthetic, no blood, no skin, empty space on the left,
no text, no logo, 16:9, 1600x900
```

## 4. Kỹ năng & quy trình — `cover-kn.jpg`

```
Minimal 3D illustration of two glossy speech bubbles (one soft yellow #FFE100, one light blue #CFE2F3)
and a small checklist card with check marks, floating in a deep navy space (#003047) with subtle
glowing connection lines, soft clay-render style with smooth lighting, modern corporate training theme,
empty space on the left, no text, no logo, no people, 16:9, 1600x900
```

---

## (Tuỳ chọn) Video ngắn cho phần đầu trang chủ

Phần đầu trang chủ hiện có **mũi khoan 3D tự xoay**, dựng bằng code (kéo chuột để xoay). Muốn thay bằng video thật thì dùng prompt video (Veo / Runway / Kling):

```
Seamless 6-second loop: a dental diamond bur slowly rotating 360 degrees on its axis, photorealistic,
golden diamond-grit head, brushed steel shank, deep navy background (#003047) with soft blue glow,
thin light-blue orbit rings circling around it, studio lighting, no text, 1920x1080, perfect loop
```

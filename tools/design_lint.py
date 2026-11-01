#!/usr/bin/env python3
"""Soát nhanh các dấu hiệu giao diện "kiểu AI" và lỗi chất lượng nền trong file HTML/CSS (chỉ dùng thư viện chuẩn).
Quy tắc và lý do: references/design-quality.md (mục 3 và 6).

Dùng:  python3 design_lint.py index.html [style.css …] [--all] [--no-fail]
  --all      in mọi vị trí (mặc định tối đa 4 vị trí mỗi quy tắc)
  --no-fail  luôn thoát mã 0 (mặc định thoát 1 khi có mức LỖI)
Bỏ qua một dòng có chủ đích: thêm chú thích chứa `design-lint: ok` trên cùng dòng (ví dụ gradient là dữ liệu)."""
import os, re, sys
from collections import Counter

ERR, WARN = "LỖI", "NÊN XEM"
args = [a for a in sys.argv[1:] if not a.startswith("--")]
SHOW_ALL, NO_FAIL = "--all" in sys.argv, "--no-fail" in sys.argv
if not args:
    print(__doc__); sys.exit(2)

EMOJI = re.compile("[\U0001F000-\U0001FAFF☀-⛿⭐⭕⌚⌛⏩-⏺"
                   "✀-✒✔✖✘-➣➥-➿]")
PURPLE = re.compile(r"#(6366f1|4f46e5|4338ca|818cf8|8b5cf6|7c3aed|6d28d9|5b21b6|a855f7|9333ea|a78bfa|c084fc|d946ef)\b"
                    r"|\b(?:from|via|to|bg|text)-(?:indigo|violet|purple|fuchsia)-\d{2,3}\b", re.I)
AI_FONTS = r"Inter|Poppins|Roboto|Montserrat|Open\+?\s?Sans|Lato|Nunito|Raleway|Space\+?\s?Grotesk"
GENERIC_BTN = re.compile(r">\s*(Submit|OK|Click here|Click vào đây|Bấm vào đây|Nhấn vào đây|Gửi đi|Xác nhận)\s*<", re.I)
HYPE = re.compile(r"liền mạch|nâng tầm|đột phá|mạnh mẽ và|trực quan và|trải nghiệm tuyệt vời|tối ưu hoá trải nghiệm|"
                  r"seamless|supercharge|unlock the|elevate your|next[- ]level|game[- ]chang", re.I)

findings = []  # (level, rule, file, line, snippet, fix)
GLOBAL = {"anim": None, "reduced": False, "no_outline": None, "focus_visible": False}  # xét trên mọi file truyền vào


def lint(path):
    src = open(path, encoding="utf-8", errors="replace").read()
    lines = src.split("\n")
    is_css = path.lower().endswith(".css")
    ln = lambda pos: src.count("\n", 0, pos) + 1
    ok = lambda pos: "design-lint: ok" in lines[ln(pos) - 1]

    def add(level, rule, pos, fix, snippet=None):
        if pos is not None and ok(pos):
            return
        line = ln(pos) if pos is not None else 0
        if line and any(f[1] == rule and f[2] == path and f[3] == line for f in findings):
            return  # một dòng chỉ báo một lần cho mỗi quy tắc
        snip = snippet if snippet is not None else (lines[line - 1].strip() if line else "")
        findings.append((level, rule, path, line, snip[:110], fix))

    # vùng CSS: cả file .css, hoặc các khối <style> + thuộc tính style="…"
    css = [(0, src)] if is_css else [(m.start(1), m.group(1)) for m in re.finditer(r"<style[^>]*>(.*?)</style>", src, re.S | re.I)]
    if not is_css:
        css += [(m.start(1), m.group(1)) for m in re.finditer(r"\sstyle=\"([^\"]*)\"", src)]

    def css_iter(pattern, flags=re.I):
        for off, block in css:
            for m in re.finditer(pattern, block, flags):
                yield off + m.start(), m

    # ── màu & bề mặt
    for pos, m in css_iter(r"(?:repeating-)?(?:linear|radial|conic)-gradient\(((?:[^()]|\([^()]*\))*)\)"):
        stops = [x.strip() for x in re.split(r",(?![^()]*\))", m.group(1))]
        colors = {re.sub(r"\s+[\d.]+(%|px)?$", "", x) for x in stops if not re.match(r"^(to\s|[\d.]+deg|circle|ellipse|at\s)", x)}
        norm = {re.sub(r"rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+).*", r"rgb(\1,\2,\3)", c) for c in colors if c != "transparent"}
        if len(norm) <= 1:
            continue  # một màu (gạch chân, nền) hoặc lớp phủ cùng màu khác độ trong (che ảnh cho chữ dễ đọc)
        ctx = src[max(0, src.rfind(";", 0, pos) + 1, src.rfind("{", 0, pos) + 1):pos].lower()
        if "mask" in ctx or m.group(0).startswith("repeating"):
            continue  # mặt nạ làm mờ mép / hoa văn sọc (băng cảnh báo, thanh tải)
        add(ERR, "Gradient trang trí", pos, "Dùng màu phẳng theo token; gradient chỉ khi là dữ liệu (thêm `design-lint: ok`).")
    for pos, m in css_iter(r"(?:-webkit-)?background-clip\s*:\s*text"):
        add(ERR, "Chữ gradient", pos, "Tiêu đề dùng màu mực --t-ink; nhấn bằng cỡ chữ / độ đậm.")
    for off, block in css + ([] if is_css else [(0, src)]):
        for m in PURPLE.finditer(block):
            add(ERR, "Tím/chàm kiểu SaaS", off + m.start(), "Thay bằng màu mmh-brand (#3A5CAA nhấn, #003047 mực) qua biến --t-*.")
        if not is_css:
            break
    for pos, m in css_iter(r"backdrop-filter\s*:\s*[^;\"}]*blur\(\s*(\d+)"):
        if int(m.group(1)) <= 4:
            continue  # làm mờ nhẹ lớp nền sau hộp thoại: chấp nhận
        add(WARN, "Kính mờ", pos, "Chỉ giữ cho thanh dính trên cùng / bảng lệnh; bỏ ở thẻ và nền.")
    shadows = []
    for pos, m in css_iter(r"box-shadow\s*:\s*([^;\"}]+)"):
        v = m.group(1).strip().lower()
        if v in ("none", "0", "inherit", "initial", "unset") or v.startswith("var("):
            continue
        shadows.append(v)
        blur = [int(x) for x in re.findall(r"\s(\d+)px", " " + v)[2:3]]
        alpha = [float(a) for a in re.findall(r"rgba?\([^)]*?,\s*(0?\.\d+|1(?:\.0)?)\s*\)", v)]
        if (blur and blur[0] >= 24) or (alpha and max(alpha) >= 0.25):
            add(WARN, "Bóng đổ nặng", pos, "Viền mảnh thay bóng; bóng nhẹ chỉ cho popover / hộp thoại.")
    if len(set(shadows)) > 4:
        add(WARN, "Quá nhiều kiểu bóng", None, "Gom còn 1–2 mức bóng (lớp nổi), đặt thành biến.",
            f"{len(set(shadows))} giá trị box-shadow khác nhau")

    # ── bố cục: bo góc
    radii = Counter()
    for pos, m in css_iter(r"border-radius\s*:\s*([^;\"}]+)"):
        for v in re.findall(r"(\d+(?:\.\d+)?)px", m.group(1)):
            if v not in ("0", "999", "9999", "1000", "50", "100"):
                radii[v] += 1
    if len(radii) > 5:
        add(WARN, "Quá nhiều bán kính bo góc", None, "Đặt 2–3 cấp: nhỏ (chip, ô nhập) · vừa (thẻ, bảng) · lớn (hộp thoại).",
            "các giá trị px: " + ", ".join(sorted(radii, key=float)))
    elif len(radii) == 1 and sum(radii.values()) >= 8:
        add(WARN, "Một bán kính cho mọi thứ", None, "Phân cấp bo góc theo vai trò thành phần.",
            f"border-radius {next(iter(radii))}px dùng {sum(radii.values())} lần")

    # ── chữ
    upper_n = 0
    for off, block in css:
        for m in re.finditer(r"([^{}]*)\{([^{}]*)\}", block):
            body = m.group(2)
            if re.search(r"text-transform\s*:\s*uppercase", body, re.I):
                upper_n += 1
                if re.search(r"letter-spacing\s*:\s*(?!0|normal|-)", body, re.I) and not re.search(r"font-family\s*:[^;]*mono|--f-mono|monospace", body, re.I):
                    add(ERR, "Nhãn IN HOA giãn chữ (eyebrow)", off + m.start(2),
                        "Bỏ nhãn trên tiêu đề, hoặc viết hoa kiểu câu, không giãn chữ.", m.group(1).strip()[:80] + " { … }")
    if upper_n > 3:
        add(WARN, "Lạm dụng IN HOA", None, "Viết hoa kiểu câu cho nhãn, nút, cột bảng.", f"{upper_n} quy tắc text-transform: uppercase")
    for m in re.finditer(r"(fonts\.googleapis\.com/css2?\?[^\"')\s]*family=(?:" + AI_FONTS + r")|@import[^;]*(?:" + AI_FONTS + "))", src, re.I):
        add(ERR, "Font mặc định kiểu AI", m.start(), "Dùng Aptos (mmh-brand) + dự phòng hệ thống; tiêu đề cần font web ⇒ Be Vietnam Pro / Archivo.")
    fams = Counter()
    for pos, m in css_iter(r"font-family\s*:\s*([^;\"}]+)"):
        first = m.group(1).split(",")[0].strip().strip("'\"").lower()
        if first and not first.startswith("var(") and first not in ("inherit", "monospace") and "mono" not in first and "consol" not in first and "courier" not in first:
            fams[first] += 1
        if re.match(r"\s*['\"]?(" + AI_FONTS + r")\b", m.group(1), re.I):
            add(WARN, "Inter/Poppins đứng đầu dãy font", pos, "Đưa Aptos lên đầu; Inter chỉ là dự phòng.")
    if len(fams) > 3:
        add(WARN, "Quá nhiều họ font", None, "Tối đa 2 họ chữ + 1 mono; đặt thành biến --f-body / --f-display.", ", ".join(fams))

    # ── chuyển động
    for pos, m in css_iter(r"transition\s*:\s*all\b"):
        add(ERR, "transition: all", pos, "Chỉ chuyển thuộc tính cần (opacity, transform, background-color), 120–200 ms.")
    if re.search(r"@keyframes|animation\s*:", src, re.I):
        GLOBAL["anim"] = GLOBAL["anim"] or path
    if re.search(r"prefers-reduced-motion", src, re.I):
        GLOBAL["reduced"] = True

    # ── truy cập: focus
    mo = re.search(r"outline\s*:\s*(none|0)\b", src, re.I)
    if mo and not ok(mo.start()):
        GLOBAL["no_outline"] = GLOBAL["no_outline"] or (path, ln(mo.start()), lines[ln(mo.start()) - 1].strip()[:110])
    if re.search(r":focus-visible", src):
        GLOBAL["focus_visible"] = True

    # ── màu viết cứng ngoài khối token
    if css:
        rest = "\n".join(b for _, b in css)
        rest = re.sub(r"(:root|html\[data-theme[^\]]*\])\s*\{[^}]*\}", "", rest)
        rest = re.sub(r"var\(--[\w-]+\s*,\s*#[0-9a-fA-F]{3,8}\)", "var()", rest)  # màu dự phòng trong var() là hợp lệ
        n_hex = len(re.findall(r"#[0-9a-fA-F]{3,8}\b", rest))
        if n_hex > 40:
            add(WARN, "Nhiều màu viết cứng", None, "Chuyển sang biến --t-* (scripts/recolor_css.py).", f"{n_hex} mã hex ngoài :root / data-theme")
    imp = len(re.findall(r"!important", src))
    if imp > 20:
        add(WARN, "Nhiều !important", None, "Sửa độ ưu tiên selector (xem SKILL.md mục 4, CSS độ ưu tiên).", f"{imp} lần !important")

    if is_css:
        return
    # ── markup & chữ
    blank = lambda m: re.sub(r"[^\n]", " ", m.group(0))   # giữ nguyên số dòng
    html = re.sub(r"<!--.*?-->", blank, src, flags=re.S)
    html = re.sub(r"/\*.*?\*/", blank, html, flags=re.S)            # chú thích CSS / JS khối
    html = re.sub(r"(?m)^\s*//.*$", blank, html)                      # dòng chú thích JS
    for m in EMOJI.finditer(html):
        line = lines[ln(m.start()) - 1]
        if re.search(r"(?:^|\s)(?://|/\*|\*)", line.split(m.group(0))[0][-40:]):  # trong chú thích JS
            continue
        add(ERR, "Emoji làm icon", m.start(), "Thay emoji bằng icon SVG (Lucide / Tabler) có aria-label; emoji trong dữ liệu người dùng thì giữ.",
            m.group(0) + "  ←  " + line.strip()[:90])
    arrows = [m.start() for m in re.finditer(r"\s?→\s*(?:</(?:a|button|span)>|['\"`])", html)]
    if len(arrows) >= 3:
        for p in arrows:
            add(WARN, "Mũi tên → sau chữ nút / link", p, "Bỏ mũi tên; nút nói rõ hành động là đủ.")
    dots = len(re.findall(r"\s·\s", re.sub(r"<(script|style)[^>]*>.*?</\1>", "", html, flags=re.S | re.I)))
    if dots > 15:
        add(WARN, "Chuỗi meta nối bằng ·", None, "Tách thành cột / nhãn rõ ràng; chỉ dùng · khi thật sự là danh sách ngắn.", f"{dots} lần ' · ' trong markup")
    for m in GENERIC_BTN.finditer(html):
        add(WARN, "Nhãn nút chung chung", m.start(), "Động từ + đối tượng: 'Lưu phiếu', 'Gửi duyệt', 'Xuất Excel'.")
    for m in HYPE.finditer(html):
        add(WARN, "Câu chữ quảng cáo", m.start(), "Nói cụ thể app làm gì cho người dùng, bỏ tính từ bán hàng.")
    for m in re.finditer(r"class=\"[^\"]*\b(eyebrow|kicker|overline|pre-?title)\b", html, re.I):
        add(WARN, "Nhãn phía trên tiêu đề", m.start(), "Thường là trang trí; bỏ nếu không mang thông tin.")
    for m in re.finditer(r"<button\b([^>]*)>(.*?)</button>", html, re.S | re.I):
        attrs, inner = m.group(1), m.group(2)
        text = re.sub(r"<[^>]+>", "", inner).strip()
        if not text and not re.search(r"aria-label(?:ledby)?\s*=|title\s*=", attrs, re.I):
            add(ERR, "Nút chỉ có icon thiếu nhãn", m.start(), "Thêm aria-label=\"…\" (và title) mô tả hành động.")
    for m in re.finditer(r"<img\b(?![^>]*\balt\s*=)[^>]*>", html, re.I):
        add(ERR, "Ảnh thiếu alt", m.start(), "Thêm alt mô tả; ảnh trang trí ⇒ alt=\"\".")
    full_page = re.search(r"<html\b|<head\b", re.sub(r"<!--.*?-->", "", src, flags=re.S), re.I)  # đoạn HTML để dán (không có <html>/<head>) thì bỏ qua
    if full_page and not re.search(r"<meta[^>]+name=[\"']viewport", src, re.I):
        add(ERR, "Thiếu meta viewport", None, "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">", "trang sẽ thu nhỏ trên điện thoại")
    if re.search(r"<html\b(?![^>]*\blang=)", src, re.I):
        add(WARN, "Thẻ <html> thiếu lang", None, "<html lang=\"vi\"> để trình đọc màn hình và ngắt dòng đúng.", "")


for p in args:
    lint(p)
if GLOBAL["anim"] and not GLOBAL["reduced"]:
    findings.append((ERR, "Thiếu prefers-reduced-motion", GLOBAL["anim"], 0, "có animation nhưng không tôn trọng cài đặt giảm chuyển động",
                     "Thêm @media (prefers-reduced-motion: reduce){ *{animation:none!important;transition:none!important} }."))
if GLOBAL["no_outline"] and not GLOBAL["focus_visible"]:
    p, l, snip = GLOBAL["no_outline"]
    findings.append((ERR, "Bỏ viền focus mà không thay thế", p, l, snip, "Thêm :focus-visible{outline:2px solid var(--t-pri);outline-offset:2px}."))

if not findings:
    print("✓ Không thấy dấu hiệu nào trong danh sách. Vẫn chụp ảnh 1440 px + 390 px và tự xem lại (design-quality.md mục 7).")
    sys.exit(0)
for level in (ERR, WARN):
    group = [f for f in findings if f[0] == level]
    if not group:
        continue
    print(f"\n━━ {level} ({len(group)}) ━━")
    by_rule = {}
    for f in group:
        by_rule.setdefault(f[1], []).append(f)
    for rule, fs in by_rule.items():
        print(f"\n▸ {rule} · {len(fs)} chỗ\n  Sửa: {fs[0][5]}")
        for f in (fs if SHOW_ALL else fs[:4]):
            rel = os.path.relpath(f[2]) if not os.path.relpath(f[2]).startswith("..") else os.path.basename(f[2])
            where = f"{rel}:{f[3]}" if f[3] else rel
            print(f"    {where}  {f[4]}")
        if not SHOW_ALL and len(fs) > 4:
            print(f"    … và {len(fs) - 4} chỗ khác (--all để xem hết)")
n_err = sum(1 for f in findings if f[0] == ERR)
print(f"\nTổng: {n_err} lỗi · {len(findings) - n_err} nên xem. Quy tắc: references/design-quality.md")
sys.exit(1 if n_err and not NO_FAIL else 0)

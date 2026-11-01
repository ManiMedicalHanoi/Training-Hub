#!/usr/bin/env python3
"""Kiểm tra cú pháp MỌI khối <script> nội tuyến trong file HTML bằng `node --check`.
Dùng: python3 check_scripts.py index.html   (thoát mã 1 nếu có lỗi, in số dòng gốc trong file HTML)"""
import re, subprocess, sys, tempfile, os
path = sys.argv[1] if len(sys.argv) > 1 else "index.html"
src = open(path, encoding="utf-8").read()
bad = 0; n = 0
with tempfile.TemporaryDirectory() as d:
    for m in re.finditer(r"<script(?![^>]*\bsrc=)([^>]*)>(.*?)</script>", src, re.S):
        attrs, code = m.group(1), m.group(2)
        if re.search(r'type=["\'](?!text/javascript|module)', attrs):   # bỏ qua JSON / template
            continue
        n += 1
        line = src.count("\n", 0, m.start(2)) + 1
        f = os.path.join(d, f"s{n}.js"); open(f, "w", encoding="utf-8").write(code)
        r = subprocess.run(["node", "--check", f], capture_output=True, text=True)
        if r.returncode:
            bad += 1
            msg = r.stderr.strip().splitlines()
            print(f"✗ khối #{n} (bắt đầu dòng {line} trong {path}):"); print("  " + "\n  ".join(msg[:6]))
print(f"{n} khối script · {bad} lỗi")
sys.exit(1 if bad else 0)

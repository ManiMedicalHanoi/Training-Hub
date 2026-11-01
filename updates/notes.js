/* Thông báo cập nhật trong app (skill gh-webapp-upgrader ▸ release-notes.md). Mỗi bản phát hành: thêm 1 mục LÊN ĐẦU mảng,
   tăng APP_VERSION trong index.html và tham số ?v= của file này. title là chữ thuần; text được dùng thẻ HTML đơn giản. */
window.APP_UPDATES = [
  {
    id: "2026-11-01-v6.4",
    version: "v6.4",
    date: "2026-11-01",
    title: "Cài Training Hub như một ứng dụng",
    summary: "Training Hub giờ cài được lên điện thoại và máy tính: có biểu tượng riêng, mở toàn màn hình, không cần gõ link, tự cập nhật.",
    items: [
      { type: "new", title: "Cài lên điện thoại Android hoặc máy tính",
        text: "Mở Training Hub bằng <b>Chrome</b> hoặc <b>Edge</b>, bấm ảnh đại diện (máy tính) hoặc nút <b>Thêm</b> (điện thoại), chọn <b>Cài ứng dụng lên máy này</b> rồi bấm <b>Cài đặt</b>. Biểu tượng <b>MMH Training</b> hiện trên màn hình chính / Start menu. <a href=\"#\" onclick=\"UPD.close();setTimeout(function(){MMHApp.install()},300);return false\">Cài ngay</a>",
        img: "updates/v6.4/menu.jpg" },
      { type: "new", title: "Cài lên iPhone / iPad",
        text: "Mở Training Hub bằng <b>Safari</b>, bấm nút <b>Chia sẻ</b> ở thanh dưới, chọn <b>Thêm vào MH chính</b> rồi bấm <b>Thêm</b>. Lần đầu mở app cần đăng nhập lại một lần. Mục <b>Cài ứng dụng lên máy này</b> trong menu cũng có hướng dẫn kèm hình.",
        img: "updates/v6.4/ios.jpg" },
      { type: "imp", title: "Mở nhanh hơn",
        text: "Logo, biểu tượng và ảnh được giữ sẵn trên máy nên app mở nhanh hơn. Dữ liệu khoá học, điểm, chứng chỉ vẫn luôn lấy mới từ máy chủ." }
    ]
  },
  {
    id: "2026-11-01-v6.3",
    version: "v6.3",
    date: "2026-11-01",
    title: "Giao diện gọn hơn, dễ nhìn hơn",
    summary: "Training Hub được chỉnh lại giao diện cho thống nhất với thương hiệu MMH và dễ đọc trên điện thoại.",
    items: [
      { type: "imp", title: "Bìa khoá học SOP, kỹ năng, Compliance rõ nhóm hơn",
        text: "Khoá chưa có ảnh bìa giờ có nền nhạt theo <b>màu của nhóm</b> (SOP xanh lá, Kỹ năng vàng, Compliance đỏ) và hình vẽ đúng loại khoá: bảng kiểm cho SOP, người thuyết trình cho Kỹ năng, khiên cho Compliance. Nhìn lướt là biết khoá thuộc nhóm nào.",
        img: "updates/v6.3/courses.jpg" },
      { type: "fix", title: "Nút nhanh ở mục Việc của tôi không còn bị cắt trên điện thoại",
        text: "Trên điện thoại, các nút <b>Video bài giảng</b> và <b>Catalogue · IFU · Slide</b> giờ hiện đủ chữ, xếp thành 2 cột, không phải vuốt ngang mới thấy.",
        img: "updates/v6.3/m_home.jpg" },
      { type: "imp", title: "Chữ và biểu tượng thống nhất",
        text: "Các nhãn nhỏ không còn viết IN HOA; biểu tượng dùng chung một bộ hình nét (nút <b>Tự lật trang</b> khi đọc tài liệu cũng vậy). Phần đầu trang, bài học và chứng chỉ dùng màu phẳng, đỡ rối mắt." },
      { type: "new", title: "Xem lại các bản cập nhật",
        text: "Trên máy tính: bấm <b>ảnh đại diện</b> (chữ viết tắt tên bạn) ở góc trên bên phải, chọn <b>Có gì mới</b>. Trên điện thoại: bấm <b>Thêm</b> ở thanh dưới, chọn <b>Có gì mới</b>. Tick <b>Không hiển thị lại</b> nếu bạn đã đọc." }
    ]
  }
];

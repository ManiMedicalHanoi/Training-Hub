/* Thông báo cập nhật trong app (skill gh-webapp-upgrader ▸ release-notes.md). Mỗi bản phát hành: thêm 1 mục LÊN ĐẦU mảng,
   tăng APP_VERSION trong index.html và tham số ?v= của file này. title là chữ thuần; text được dùng thẻ HTML đơn giản. */
window.APP_UPDATES = [
  {
    id: "2026-11-02-v6.6",
    version: "v6.6",
    date: "2026-11-02",
    title: "Xem tài liệu dạng trình chiếu ngay trên app",
    summary: "Tài liệu PDF, PowerPoint, Word được trainer đăng lên app sẽ mở dạng trình chiếu, không cần quyền Google Drive. Xem đủ 70% số trang là được tính hoàn thành.",
    items: [
      { type: "new", title: "Tài liệu mở dạng trình chiếu",
        text: "Bấm vào tài liệu có nhãn <b>Trên app</b>: mỗi màn hình 1 trang, bấm <b>‹ ›</b>, phím mũi tên hoặc vuốt ngang để lật. Xem đủ <b>70% số trang</b> (mỗi trang dừng ít nhất 1–2 giây) là tài liệu được tính hoàn thành. Không còn lỗi \"Cần quyền truy cập\" của Drive.",
        img: "updates/v6.6/deck.jpg" },
      { type: "new", title: "Trainer: đăng tài liệu lên app",
        text: "Mở trang khoá học, bấm <b>Tài liệu xem trên app</b>, rồi bấm <b>Đăng tất cả chưa đăng</b>. PowerPoint / Word tự chuyển sang PDF (lần đầu 10–60 giây / file). Bản đăng nằm trên GitHub <b>công khai</b>, file gốc vẫn ở Drive. Sửa file trên Drive xong thì bấm <b>Đăng lại</b>.",
        img: "updates/v6.6/manage.jpg" },
      { type: "imp", title: "Trình xem của Google không còn tự tính xong",
        text: "Trong lộ trình học, mở tài liệu bằng <b>Xem nhanh</b> (trình xem Google) không còn được tính xong sau 30 giây vì hệ thống không biết bạn đã xem tới đâu. Bấm <b>Qua Hub</b> ở phía trên để được tính hoàn thành." }
    ]
  },
  {
    id: "2026-11-02-v6.5",
    version: "v6.5",
    date: "2026-11-02",
    title: "Lộ trình chia thư mục, video phải xem đủ mới được tua",
    summary: "Lộ trình học chia rõ Sản phẩm và Kiến thức y khoa, mỗi phần có thư mục theo chuyên khoa. Video bài giảng phải xem đủ 70% lần đầu mới được tua và tăng tốc. Màn hình máy tính rộng hiển thị gọn hơn.",
    items: [
      { type: "new", title: "Lộ trình học chia thư mục theo chuyên khoa",
        text: "Bấm <b>Lộ trình</b>, chọn <b>Sản phẩm</b> hoặc <b>Kiến thức y khoa</b>. Hàng thư mục <b>Nha khoa · Nhãn khoa · Ngoại khoa · MMG</b> hiện ngay bên dưới, bấm 1 thư mục để chỉ xem khoá học của chuyên khoa đó.",
        img: "updates/v6.5/learn.jpg" },
      { type: "imp", title: "Trainer: chọn chỗ xếp khoá học khi tạo / sửa",
        text: "Trong form khoá học nhóm <b>Product</b>, chọn <b>Loại nội dung</b> (Sản phẩm / Kiến thức y khoa) và <b>Chuyên khoa</b>. Chỉ dùng để sắp xếp ở Lộ trình, KPI đào tạo không thay đổi. Khoá cũ có nhóm Nha khoa / Nhãn khoa / Ngoại khoa được xếp vào Kiến thức y khoa.",
        img: "updates/v6.5/form.jpg" },
      { type: "imp", title: "Video phải xem đủ 70% lần đầu mới được tua",
        text: "Lần đầu xem video bài giảng, bạn chỉ xem được ở tốc độ <b>1x</b> và không tua tới được. Xem đủ <b>70%</b> là video được tính hoàn thành, sau đó tua và tăng tốc tự do.",
        img: "updates/v6.5/video.jpg" },
      { type: "imp", title: "Video trên Google Drive cần đưa lên trình phát Hub",
        text: "Hub không đếm được thời gian xem của video mở bằng Google Drive, nên video này không còn tự tính xong. Trainer mở video trong lộ trình, bấm <b>Đưa lên trình phát Hub</b> (video tối đa 25 MB, lớn hơn thì nén về 720p trước). Sau đó học viên xem và được tính đúng 70%." },
      { type: "fix", title: "Màn hình máy tính rộng hiển thị gọn hơn",
        text: "Trên màn hình rộng (từ 1600 px), khung nội dung rộng ra, hai bên bớt trống. Chữ ở phần đầu trang chủ không còn đè lên ảnh và nút, thanh menu trên cùng luôn nằm trên 1 dòng.",
        img: "updates/v6.5/wide.jpg" }
    ]
  },
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

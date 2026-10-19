/* =====================================================================
   SỬA NỘI DUNG Ở ĐÂY
   - password: mật khẩu (chỉ dùng số, độ dài tùy ý)
   - coverPhoto: ảnh ở màn khóa. Thả ảnh vào thư mục images/ rồi ghi đúng tên file.
   - letter: nội dung lá thư. Mỗi phần tử trong body là một đoạn.
   - bouquet.photos: ảnh trong bó hoa, tối đa 9 ảnh. Ảnh đầu tiên nằm ở bông to nhất ở giữa.
     Ít hơn 9 ảnh thì các bông còn lại là hoa thường (không có ảnh).
     Ghi tên file mà file không tồn tại thì bông đó dùng ảnh mẫu.
   - Ảnh nên vuông hoặc gần vuông, khoảng 600-1000px, đuôi .jpg/.png/.webp
     (tên file phân biệt chữ hoa/thường khi chạy trên GitHub Pages).
   - music: nhạc nền, bật khi nhập đúng mật khẩu. Thả file .mp3 vào thư mục music/
     rồi ghi đúng tên. Để src: "" nếu không muốn có nhạc.
     volume: 0 → 1. start: giây bắt đầu phát (để bỏ qua đoạn dạo đầu).
   ===================================================================== */
const CONFIG = {
  password: "1701",
  hint: "Gợi ý: ngày mình quen nhau (ngày + tháng)",
  coverPhoto: "images/bia.jpg",
  envelopeText: "Gửi người xinh gái nhất thế giới",
  music: {
    src: "music/de-danh-cho-em.mp3",
    volume: 0.6,
    start: 98 // 1:38, ngay trước điệp khúc
  },
  letter: {
    date: "",
    greeting: "Gửi người xinh gái nhất thế giới,",
    body: [
      "20/10 rồi, chúc Huyền càng ngày càng xinh hơn, giàu hơn và gặp đúng người hơn.",
      "Riêng vụ “đúng người” thì là như Trí từng nói nhé, là Trí của ngày mai nhé 😄"
    ],
    closing: "Tri Le,",
    signature: "Love",
    button: "Trí có quà cho Huyền nè →" // nút hiện ra khi đọc xong thư
  },
  bouquet: {
    title: "Tặng Huyền nha ♥",
    note: "Ảnh siêu xinh của Huyền nè",
    tag: "Mãi iu ♥",
    photos: [
      "images/hoa-1.jpg",
      "images/hoa-2.jpg",
      "images/hoa-3.jpg",
      "images/hoa-4.jpg",
      "images/hoa-5.jpg",
      "images/hoa-6.jpg"
    ]
  }
};
/* ===================================================================== */

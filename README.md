# Lá Thư Gửi Em

Trang web nhỏ gồm: nhập mật khẩu → mở phong bì → đọc thư → bó hoa ảnh.

## Cấu trúc

```
thu-gui-em/
├── index.html        # khung trang (không cần sửa)
├── css/style.css     # giao diện
├── js/config.js      # NỘI DUNG: mật khẩu, lá thư, danh sách ảnh, nhạc  ← sửa ở đây
├── js/main.js        # logic, hiệu ứng, vẽ bó hoa
├── images/           # ảnh của bạn
└── music/            # nhạc nền
```

## 1. Sửa nội dung

Mở `js/config.js` và sửa:

- `password`: mật khẩu (chỉ dùng số)
- `hint`: câu gợi ý khi nhập sai
- `letter`: lời chào, các đoạn thư, lời kết, chữ ký
- `bouquet.photos`: danh sách ảnh trong bó hoa (tối đa 9)
- `bouquet.tag`: chữ trên tấm thiệp treo ở nơ

## 2. Thêm ảnh

Thả ảnh vào thư mục `images/` với đúng tên:

| File | Vị trí |
|---|---|
| `bia.jpg` | ảnh ở màn khóa |
| `hoa-1.jpg` | bông to nhất ở giữa |
| `hoa-2.jpg` … `hoa-9.jpg` | các bông còn lại (tối đa 9 ảnh) |

- Thêm/bớt ảnh thì sửa danh sách `bouquet.photos` trong `config.js`. Ít hơn 9 ảnh thì các bông còn lại tự thành hoa thường không có ảnh.
- Ghi tên file trong danh sách mà file không có thì bông đó dùng ảnh mẫu, không bị lỗi.
- Ảnh nên vuông hoặc gần vuông, cỡ khoảng 600–1000px, dung lượng dưới 500KB mỗi ảnh để tải nhanh.
- Ảnh đuôi `.png` hay `.webp` thì sửa tên tương ứng trong `config.js`.
- Trên GitHub Pages tên file **phân biệt hoa/thường**: `Hoa-1.JPG` khác `hoa-1.jpg`.

## 3. Thêm nhạc nền

1. Thả file nhạc vào thư mục `music/` rồi ghi đúng tên vào `music.src` trong `config.js`. Nên đặt tên không dấu, không khoảng trắng (ví dụ `de-danh-cho-em.mp3`).
2. Tuỳ chỉnh trong `config.js`:
   - `volume`: âm lượng từ `0` đến `1` (mặc định `0.6`)
   - `start`: số giây bắt đầu phát, ví dụ `start: 45` để vào thẳng điệp khúc
   - Không muốn có nhạc thì để `src: ""`

- Nhạc bắt đầu khi nhập đúng mật khẩu (trình duyệt không cho tự phát nhạc trước khi người xem chạm vào trang), nhỏ dần lên rồi lặp lại liên tục.
- Góc trên bên phải có nút ♪ để tắt/bật nhạc. Thiếu file nhạc thì nút không hiện, trang vẫn chạy bình thường.
- Nên dùng `.mp3` (chạy được trên mọi trình duyệt), dung lượng dưới khoảng 5MB để tải nhanh.
- Trên iPhone âm lượng theo nút âm lượng của máy, `volume` không có tác dụng.
- `start` chạy đúng khi nhấp đúp `index.html`, dùng Live Server, hoặc trên GitHub Pages/Netlify/Vercel. Riêng `python -m http.server` không hỗ trợ tua nên nhạc sẽ phát từ đầu, đó là do server chạy thử chứ không phải lỗi trang.

## 4. Chạy thử trên máy

Nhấp đúp `index.html` là chạy được. Hoặc dùng VS Code + extension **Live Server**, hoặc:

```bash
python -m http.server 8000
# mở http://localhost:8000
```

## 5. Đưa lên GitHub Pages

1. Tạo repo mới trên GitHub (ví dụ `thu-gui-em`), **không** tick tạo README.
2. Trong thư mục project:

```bash
git init
git add .
git commit -m "Lá thư gửi em"
git branch -M main
git remote add origin https://github.com/<ten-github-cua-ban>/thu-gui-em.git
git push -u origin main
```

3. Trên GitHub: **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main**, thư mục **/ (root)** → **Save**
4. Đợi 1–2 phút, trang sẽ chạy ở:
   `https://<ten-github-cua-ban>.github.io/thu-gui-em/`

Sửa gì thì `git add . && git commit -m "cập nhật" && git push`, GitHub Pages tự cập nhật sau ít phút.

## Lưu ý

- Mật khẩu chỉ để tạo cảm giác bất ngờ, **không phải bảo mật thật**: ai mở mã nguồn (hoặc xem repo) đều đọc được thư và ảnh.
- GitHub Pages miễn phí yêu cầu repo **public**, nên ảnh và nội dung thư sẽ công khai trên GitHub. Nếu không muốn vậy, có thể deploy bằng Netlify hoặc Vercel (kéo thả thư mục, không cần repo public).

# JWT Auth Portal Frontend

Frontend React cho [JWT Authentication API](https://auth-api-jne3.onrender.com), triển khai theo luồng xác thực chung và phân nhánh dashboard bằng role `user`/`admin`.

## Công nghệ

- React 19 + Vite
- React Router
- Tailwind CSS 4
- Lucide React
- Native Fetch API

## Chạy local

```bash
npm install
copy .env.example .env
npm run dev
```

Biến môi trường:

```env
VITE_API_URL=https://auth-api-jne3.onrender.com
```

## Frontend routes

| Route                | Access     | Chức năng                             |
| -------------------- | ---------- | --------------------------------------- |
| `/login`           | Public     | Đăng nhập chung cho user/admin       |
| `/register`        | Public     | Đăng ký tài khoản role user        |
| `/dashboard`       | User/Admin | Thông tin từ`GET /api/auth/me`      |
| `/change-password` | User/Admin | Đổi mật khẩu và thu hồi token cũ |
| `/admin`           | Admin      | Admin overview                          |
| `/admin/users`     | Admin      | Danh sách user có pagination          |
| `/forbidden`       | Public     | Trang lỗi 403                          |
| `/session-expired` | Public     | Phiên đăng nhập hết hạn           |

## Authentication flow

1. Login trả về JWT và public user.
2. Nếu chọn “Ghi nhớ đăng nhập”, session được lưu trong `localStorage`; nếu không, dùng `sessionStorage`.
3. Protected route gắn header `Authorization: Bearer <token>`.
4. User được chuyển tới `/dashboard`; admin được chuyển tới `/admin`.
5. Response `401` xóa session và chuyển tới trang session expired.
6. Đổi mật khẩu thành công xóa token vì backend đã tăng `tokenVersion`.
7. Logout gọi API rồi luôn xóa session phía client.

## Kiểm tra code

```bash
npm run lint
npm run build
```



## Demo accounts

- User account: Có thể đăng ký trực tiếp trên giao diện.
- Admin account: user-render@example.com/NewPass123



## Deploy

Project có `vercel.json` để mọi React Router path fallback về `index.html` khi deploy Vercel.

Sau khi deploy frontend, thêm domain frontend vào biến `CLIENT_ORIGIN` của backend Render. Có thể cấu hình nhiều origin bằng dấu phẩy:

```text
http://localhost:5173,https://your-frontend.vercel.app
```

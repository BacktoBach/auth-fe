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
npm run dev
```

Khi chạy local, Vite proxy `/api` và `/health` tới backend tại `http://localhost:3000`. Frontend không cần biến môi trường chứa URL backend.

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

1. Login gửi email, password và `remember`; backend đặt JWT trong cookie `httpOnly`.
2. Frontend không đọc JWT và không lưu JWT trong LocalStorage/SessionStorage.
3. Mọi API request dùng URL tương đối `/api/*` với `credentials: "include"`.
4. Khi reload, `AuthProvider` gọi `/api/auth/me` để khôi phục user và thời hạn session.
5. User được chuyển tới `/dashboard`; admin được chuyển tới `/admin`.
6. Response `401` từ protected request được xử lý tập trung và chuyển tới trang session expired.
7. Đổi mật khẩu làm backend tăng `tokenVersion`, xóa cookie và đăng xuất mọi tab.
8. Logout xóa cookie hiện tại; trạng thái đăng nhập được đồng bộ giữa các tab.

`remember=true` tạo persistent cookie tối đa một ngày. `remember=false` tạo session cookie; JWT bên trong vẫn hết hạn sau một ngày.

## Kiểm tra code

```bash
npm run lint
npm test
npm run build
```



## Demo accounts

- User account: Có thể đăng ký trực tiếp trên giao diện.
- Admin account: user-render@example.com/NewPass123



## Deploy

Project dùng `vercel.json` để:

- Reverse proxy `/api/*` và `/health` sang [Auth API trên Render](https://auth-api-jne3.onrender.com).
- Fallback các React Router path về `index.html`.

API rewrite phải đứng trước SPA fallback. Không cần cấu hình `VITE_API_URL` trên Vercel.

Sau khi deploy frontend, thêm domain frontend vào biến `CLIENT_ORIGIN` của backend Render. Có thể cấu hình nhiều origin bằng dấu phẩy:

```text
http://localhost:5173,https://auth-fe-backtobach.vercel.app
```

Production hiện dùng `CLIENT_ORIGIN=https://auth-fe-backtobach.vercel.app`. Sau deploy, kiểm tra login response có cookie `__Host-auth_session` với `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, sau đó reload dashboard để xác minh `/me` khôi phục session.

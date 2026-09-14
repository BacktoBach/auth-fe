# JWT Auth Portal Frontend

Frontend React cho JWT Authentication API, triển khai luồng xác thực bằng JWT trong cookie `httpOnly` và phân nhánh dashboard theo role `user`/`admin`.

## Links

- Backend API production: [https://auth-api-jne3.onrender.com](https://auth-api-jne3.onrender.com)
- Backend source code: [github.com/BacktoBach/auth-api](https://github.com/BacktoBach/auth-api)

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
| `/admin/users`     | Admin      | Search và phân trang danh sách user  |
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

Frontend được deploy trên Vercel và backend được deploy độc lập trên Render. Hai service được kết nối bằng reverse proxy để browser luôn gọi API qua cùng origin với frontend:

```text
Browser
  -> https://auth-fe-backtobach.vercel.app/api/*
  -> Vercel rewrite
  -> https://auth-api-jne3.onrender.com/api/*
```

### Backend CORS and origin configuration

Backend phải khai báo exact frontend origin trong biến `CLIENT_ORIGIN`. Production hiện sử dụng:

```env
CLIENT_ORIGIN=https://auth-fe-backtobach.vercel.app
```

Khi cần hỗ trợ nhiều frontend origin, các giá trị được phân tách bằng dấu phẩy, không có path hoặc dấu `/` cuối:

```env
http://localhost:5173,https://auth-fe-backtobach.vercel.app
```

Preview deployment sử dụng domain Vercel khác production. Nếu cần test login trên preview, exact preview origin cũng phải được thêm tạm thời vào `CLIENT_ORIGIN`; backend không sử dụng wildcard origin khi gửi credential cookie.

### Deployment verification

Sau khi cả hai service hoạt động:

1. Mở frontend production và đăng nhập.
2. Kiểm tra request sử dụng `/api/auth/login`, không gọi trực tiếp domain Render từ browser.
3. Kiểm tra login response không chứa raw JWT.
4. Kiểm tra cookie `__Host-auth_session` có `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/` và không có `Domain` attribute.
5. Reload dashboard và xác minh `GET /api/auth/me` khôi phục session.
6. Kiểm tra LocalStorage và SessionStorage không chứa JWT.
7. Đăng xuất và xác minh protected route chuyển về `/login`.

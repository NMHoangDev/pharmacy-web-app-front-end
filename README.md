# Pharmacy Frontend Overview

## Tổng quan

Frontend của Pharmacy App là ứng dụng React, tập trung vào trải nghiệm mua thuốc, đặt lịch, theo dõi đơn hàng và tương tác với hệ thống nhà thuốc qua API Gateway.

## Frontend làm được gì

- Xác thực người dùng: đăng ký, đăng nhập, quản lý phiên đăng nhập.
- Hiển thị danh mục sản phẩm/thuốc, tìm kiếm và xem chi tiết.
- Quản lý giỏ hàng và cập nhật số lượng sản phẩm theo thời gian sử dụng.
- Đặt hàng và theo dõi trạng thái đơn hàng.
- Tích hợp thanh toán theo luồng checkout.
- Đặt lịch hẹn với dược sĩ/chi nhánh nhà thuốc.
- Xem danh sách dược sĩ và thông tin liên quan.
- Hiển thị bản đồ/vị trí với tính năng liên quan đến chi nhánh.
- Quản lý profile người dùng và cập nhật thông tin cá nhân.
- Tích hợp thông báo và luồng sự kiện theo nghiệp vụ.
- Hỗ trợ nội dung CMS và các khu vực bài viết/bản tin khi cần.
- Hỗ trợ tương tác chat/thời gian thực cho một số nghiệp vụ cần realtime.

## Công nghệ đã sử dụng

- React 19 + React DOM 19.
- Create React App (react-scripts 5) cho build pipeline.
- React Router DOM 7 cho định tuyến client-side.
- TanStack React Query cho fetch/cache/sync dữ liệu API.
- Axios cho HTTP client và cấu hình gọi API.
- Tailwind CSS + PostCSS + Autoprefixer cho styling.
- tailwind-merge và clsx để quản lý className linh hoạt.
- Framer Motion cho animation/UI transitions.
- Radix UI Dialog cho các modal truy cập tốt.
- Tiptap editor cho tính năng nhập nội dung rich text.
- STOMP (sockjs-client + @stomp/stompjs) cho giao tiếp realtime.
- Leaflet + react-leaflet cho map và geolocation UI.
- Testing Library (react/dom/jest-dom/user-event) cho unit/integration test UI.

## Tích hợp hệ thống

- Frontend gọi backend qua API Gateway.
- Cấu hình proxy local hiện tại hướng về `http://localhost:8087`.
- Khả năng mở rộng theo module nghiệp vụ nhóm user, đơn hàng, thanh toán, thông báo.

## Lệnh chạy nhanh

```bash
npm ci
npm start
```

Build production:

```bash
npm run build
```

Run test:

```bash
npm test
```

## Giá trị chính của frontend

- Trải nghiệm người dùng nhất quán từ tìm thuốc đến thanh toán.
- Dễ thêm tính năng mới theo từng domain mà không cần thay đổi tổng thể.
- Có sẵn nền tảng công nghệ hiện đại cho hiệu năng, mở rộng và bảo trì lâu dài.

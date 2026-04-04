# Animation & Loading Guide

## Overview

Ứng dụng đã được trang bị một system animation chuyên nghiệp và loading page đẹp. Tất cả các animations được thiết kế để:

- Tăng trải nghiệm người dùng (UX)
- Giữ màn hình chuyên nghiệp
- Không gây overhead về performance
- Dễ dàng tích hợp vào bất kỳ component nào

## File Configurations

- **animations.css** - Chứa tất cả keyframes và animation classes
- **loading.css** - Chứa loading overlay styles
- **LoadingContext.js** - Context để quản lý loading state
- **LoadingOverlay.js** - Loading component
- **useAnimations.js** - Hooks và utilities cho animations

## 1. Loading Overlay

### Sử dụng Loading Context

```jsx
import { useLoading } from "../context/LoadingContext";

function MyComponent() {
  const { showLoading, hideLoading } = useLoading();

  const handleFetch = async () => {
    showLoading("Đang tải dữ liệu...");
    try {
      // API call
      await fetchData();
    } finally {
      hideLoading();
    }
  };

  return <button onClick={handleFetch}>Load Data</button>;
}
```

### Custom Loading Messages

```jsx
showLoading("Đang xử lý yêu cầu...");
showLoading("Đang tải trang...");
showLoading("Vui lòng chờ...");
```

## 2. Page Entrance Animations

### Sử dụng AnimatedPage Component

```jsx
import { AnimatedPage } from "../hooks/useAnimations";

function HomePage() {
  return (
    <AnimatedPage animation="fade-up">
      <div className="container">{/* Page content */}</div>
    </AnimatedPage>
  );
}
```

### Animation Types

- **fade-up** - Fade in từ dưới (mặc định)
- **fade-scale** - Fade + scale animation
- **slide-left** - Slide vào từ trái
- **slide-right** - Slide vào từ phải
- **slide-top** - Slide vào từ trên

## 3. Staggered List Animations

### Sử dụng cho danh sách

```jsx
import { StaggerContainer, StaggerItem } from "../hooks/useAnimations";

function MedicineList({ medicines }) {
  return (
    <StaggerContainer className="space-y-4">
      {medicines.map((medicine) => (
        <StaggerItem key={medicine.id}>
          <MedicineCard medicine={medicine} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
```

### CSS Classes trực tiếp

```jsx
<div className="space-y-4">
  {items.map((item, i) => (
    <div key={i} className="stagger-item">
      {item}
    </div>
  ))}
</div>
```

## 4. Interactive Elements

### Button Animations

```jsx
<button className="interactive-hover button-interactive">Click me</button>
```

**Kết quả:**

- Hover: Lift up effect với shadow
- Click: Press effect
- Focus: Glow effect

### Card Hover

```jsx
<div className="interactive-hover">
  <div className="card p-4">Card content</div>
</div>
```

## 5. Skeleton Loaders

### Skeleton Loading

```jsx
import "../styles/loading.css";

function MedicineListSkeleton() {
  return (
    <div className="skeleton-card skeleton">
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line w-2/3"></div>
    </div>
  );
}
```

### Pulse Loading

```jsx
<div className="animate-pulse">
  <div className="h-12 bg-surface-2 rounded"></div>
</div>
```

## 6. Modals & Overlays

### Modal Animation

```jsx
<div className="modal-overlay">
  <div className="modal-content">{/* Modal content */}</div>
</div>
```

## 7. Notifications

### Notification Animation

```jsx
<div className="notification-enter">
  <div className="bg-green-500 p-4 rounded">Success message</div>
</div>
```

### Notification Exit

```jsx
// Add class on exit
<div className="notification-exit">Dismissing notification</div>
```

## 8. Tailwind Classes

### Animations built-in

```jsx
// Sử dụng trực tiếp Tailwind classes
<div className="animate-fade-in-up"></div>
<div className="animate-fade-in-scale"></div>
<div className="animate-slide-in-left"></div>
<div className="animate-pulse"></div>
<div className="animate-spin"></div>
```

## 9. Spinners for Buttons

### Small Spinner (trong button)

```jsx
<button>
  <span className="spinner-small"></span>
  Loading...
</button>
```

### Tiny Spinner

```jsx
<span className="spinner-tiny"></span>
```

## 10. Progress Bar

```jsx
<div className="progress-bar">
  <div className="progress-bar-fill w-1/3"></div>
</div>
```

## Best Practices

1. **Không lạm dụng animations**
   - Chỉ áp dụng cho những element quan trọng
   - Tránh quá nhiều animations cực đạo

2. **Performance**
   - CSS animations tự động tối ưu hơn JS animations
   - Sử dụng transform và opacity cho smooth animations

3. **Accessibility**
   - Tôn trọng `prefers-reduced-motion`
   - Đảm bảo content vẫn accessible ngay cả không animation

4. **Consistency**
   - Sử dụng cùng animation types cho similar interactions
   - Giữ duration và timing consistent

5. **Mobile**
   - Animations vẫn smooth trên mobile devices
   - Sử dụng 0.3s - 0.5s duration cho better UX

## Customization

### Thay đổi colors

Sửa CSS variables trong `index.css`:

```css
:root {
  --primary: #2f8cff;
  --primary-hover: #1f6fdb;
}
```

### Thêm animation mới

Thêm vào `animations.css`:

```css
@keyframes myAnimation {
  from {
    /* ... */
  }
  to {
    /* ... */
  }
}

.animate-my-animation {
  animation: myAnimation 0.5s ease-out;
}
```

## Examples

### Complete Page dengan Loading

```jsx
import { useLoading } from "../context/LoadingContext";
import {
  AnimatedPage,
  StaggerContainer,
  StaggerItem,
} from "../hooks/useAnimations";

function MedicinesPage() {
  const { showLoading, hideLoading } = useLoading();
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    const loadMedicines = async () => {
      showLoading("Đang tải danh sách thuốc...");
      try {
        const data = await fetchMedicines();
        setMedicines(data);
      } finally {
        hideLoading();
      }
    };
    loadMedicines();
  }, []);

  return (
    <AnimatedPage animation="fade-up">
      <div className="container mx-auto p-4">
        <h1>Danh sách thuốc</h1>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {medicines.map((medicine) => (
            <StaggerItem key={medicine.id}>
              <div className="interactive-hover">
                <div className="card bg-surface p-4 rounded-lg">
                  {medicine.name}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </AnimatedPage>
  );
}
```

## Troubleshooting

### Animation không chạy

- ✅ Kiểm tra class names có đúng không
- ✅ Kiểm tra CSS files được import
- ✅ Xóa browser cache

### Performance lag

- ✅ Giảm số animations cùng lúc
- ✅ Sử dụng `will-change: transform`
- ✅ Kiểm tra browser DevTools Performance tab

### Không thấy loading overlay

- ✅ Kiểm tra LoadingProvider được wrap App
- ✅ Kiểm tra z-index: 9999 không bị cover
- ✅ Kiểm tra LoadingOverlay component được render

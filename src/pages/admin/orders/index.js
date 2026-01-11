import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import OrdersToolbar from "../../../components/admin/orders/OrdersToolbar";
import OrdersTable from "../../../components/admin/orders/OrdersTable";
import OrderDetailPanel from "../../../components/admin/orders/OrderDetailPanel";

const formatCurrency = (n) => `$${Number(n).toFixed(2)}`;

const initialOrders = [
  {
    id: "ORD-001",
    customer: "Nguyen Van A",
    date: "2023-10-24T10:30:00",
    total: 120,
    payment: "paid",
    status: "processing",
    phone: "+84 901 234 567",
    address: "123 Le Loi, Ben Thanh, Quan 1, HCMC",
    customerNote: "Khách hàng thân thiết",
    items: [
      {
        name: "Panadol Extra (Red)",
        meta: "Hộp 100 viên",
        qty: 2,
        priceLabel: "$12.00",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDJlRa1D3FfdFZJwNztwKBNDeHUgu4pm7qdAccMjVuGHsDG_2P97VnMhCgqoDfGRZxoi-iam8q6LbWY79ae7r9y_Zi8dsNzofeuRRABX11DS_UNKtssWW8HcEumnJLroXgC5FIaqhkiMnC5MO8h4DAtnRIEksOJQh2MAa3T1ukOUhSA9r4cQ-XGKQYDzES9hO5ef2ZDSs9Y6Vnlh2hp5GK0hnIYX3dp_IteReudUKTL1xSGmrLaCflsjN-GWr0PQyV_tR6hqlxfyesV",
      },
      {
        name: "Prospan Cough Syrup",
        meta: "Chai 100ml",
        qty: 1,
        priceLabel: "$15.50",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDaQj4XRW5jfP9SHomgrDuvXJMclb075fc2wtxURRWd2Xy5XTgIBRwgc6gVhX6nqfKcdjyrFicTWrD_6iu5oDl1YUB7HYxGtrUNlb3zr3TmYkq3b9onpTJLnZOARM6ZxJwdby4DeXUlUOssvAggC-6A--wdo-UEGh6XCKTDCh7uC8FLzHr1_4C5ugLCEmM4QbTa199QFfxmTTn8Vvm0iOtTIua8d-MbhoXXTcDLI0OMdJOPU04kGKyffmA9cG-wRpjh0iHpjtq4bfa2",
      },
      {
        name: "Vitamin C 500mg",
        meta: "Hộp 30 viên",
        qty: 5,
        priceLabel: "$8.00",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBfMN4lxPOoF6fRE5YjW6fpf-jgRLz6oFjyYoxtyql9dAnwn4el6TRjd2af5sUezxF8ob4UNPInA6H6OjnUDc6t6Et15TnacmNiMOK_CEdoUu6HGGAZrSqaIOQAi7aC7X1ehv7YPScBRqlJJY5AEJUot1T-_IpRNYTwLfcdAPylcvh_WBMmST7AfeLNzMAcCmih8I8VY_qyZsZZKkSHBxTy2hv_pecx7TM3AxKNGMYi2ISAcbVk2fJDqF2ukN699nmpZw0iqasr_Y-C",
      },
    ],
    shipping: 5,
  },
  {
    id: "ORD-002",
    customer: "Tran Thi B",
    date: "2023-10-23T14:15:00",
    total: 45.5,
    payment: "unpaid",
    status: "pending",
    phone: "+84 912 000 333",
    address: "456 Nguyen Trai, District 5, HCMC",
    customerNote: "Cần gọi xác nhận trước khi giao",
    items: [
      {
        name: "Berocca Performance",
        meta: "Tuýp 10 viên",
        qty: 1,
        priceLabel: "$25.00",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBIt8MB3u8OOCHANLF2CfTXKV36q0kIDmFtyRTToFpWedLMfMGNvAO_G5JlIPX_KOupdwB3n2pdSHFjen0prE_X3HOuIoPftCim5JtO6d8HomqrWU7JYGSaVjJUChCgvlNQUJyjFSf1gLkCHKvJa5EOp4pLHxiSGNT0_GqEyBb5qsiZel8GLwi0MracgKGTbeGkIrwffj58oPBD9Jz0gK_CI8D8BpyOwCsnM-aPV-4_XNhNnt2f70cGkecbre3Q9Fo1grgr2U90_n6s",
      },
      {
        name: "Vitamin C 500mg",
        meta: "Hộp 30 viên",
        qty: 3,
        priceLabel: "$8.00",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBfMN4lxPOoF6fRE5YjW6fpf-jgRLz6oFjyYoxtyql9dAnwn4el6TRjd2af5sUezxF8ob4UNPInA6H6OjnUDc6t6Et15TnacmNiMOK_CEdoUu6HGGAZrSqaIOQAi7aC7X1ehv7YPScBRqlJJY5AEJUot1T-_IpRNYTwLfcdAPylcvh_WBMmST7AfeLNzMAcCmih8I8VY_qyZsZZKkSHBxTy2hv_pecx7TM3AxKNGMYi2ISAcbVk2fJDqF2ukN699nmpZw0iqasr_Y-C",
      },
    ],
    shipping: 5,
  },
  {
    id: "ORD-003",
    customer: "Le Van C",
    date: "2023-10-23T09:00:00",
    total: 210,
    payment: "paid",
    status: "completed",
    phone: "+84 987 777 222",
    address: "789 Vo Thi Sau, District 3, HCMC",
    customerNote: "Khách mua định kỳ",
    items: [
      {
        name: "Panadol Extra (Red)",
        meta: "Hộp 100 viên",
        qty: 5,
        priceLabel: "$12.00",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDJlRa1D3FfdFZJwNztwKBNDeHUgu4pm7qdAccMjVuGHsDG_2P97VnMhCgqoDfGRZxoi-iam8q6LbWY79ae7r9y_Zi8dsNzofeuRRABX11DS_UNKtssWW8HcEumnJLroXgC5FIaqhkiMnC5MO8h4DAtnRIEksOJQh2MAa3T1ukOUhSA9r4cQ-XGKQYDzES9hO5ef2ZDSs9Y6Vnlh2hp5GK0hnIYX3dp_IteReudUKTL1xSGmrLaCflsjN-GWr0PQyV_tR6hqlxfyesV",
      },
      {
        name: "Prospan Cough Syrup",
        meta: "Chai 100ml",
        qty: 2,
        priceLabel: "$15.50",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDaQj4XRW5jfP9SHomgrDuvXJMclb075fc2wtxURRWd2Xy5XTgIBRwgc6gVhX6nqfKcdjyrFicTWrD_6iu5oDl1YUB7HYxGtrUNlb3zr3TmYkq3b9onpTJLnZOARM6ZxJwdby4DeXUlUOssvAggC-6A--wdo-UEGh6XCKTDCh7uC8FLzHr1_4C5ugLCEmM4QbTa199QFfxmTTn8Vvm0iOtTIua8d-MbhoXXTcDLI0OMdJOPU04kGKyffmA9cG-wRpjh0iHpjtq4bfa2",
      },
    ],
    shipping: 0,
  },
  {
    id: "ORD-004",
    customer: "Pham Thi D",
    date: "2023-10-22T11:20:00",
    total: 85,
    payment: "paid",
    status: "shipped",
    phone: "+84 933 456 111",
    address: "12 Hai Ba Trung, District 1, HCMC",
    customerNote: "Đang chuyển",
    items: [
      {
        name: "Berocca Performance",
        meta: "Tuýp 10 viên",
        qty: 1,
        priceLabel: "$25.00",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBIt8MB3u8OOCHANLF2CfTXKV36q0kIDmFtyRTToFpWedLMfMGNvAO_G5JlIPX_KOupdwB3n2pdSHFjen0prE_X3HOuIoPftCim5JtO6d8HomqrWU7JYGSaVjJUChCgvlNQUJyjFSf1gLkCHKvJa5EOp4pLHxiSGNT0_GqEyBb5qsiZel8GLwi0MracgKGTbeGkIrwffj58oPBD9Jz0gK_CI8D8BpyOwCsnM-aPV-4_XNhNnt2f70cGkecbre3Q9Fo1grgr2U90_n6s",
      },
    ],
    shipping: 5,
  },
  {
    id: "ORD-005",
    customer: "Hoang Van E",
    date: "2023-10-22T16:45:00",
    total: 15,
    payment: "refunded",
    status: "cancelled",
    phone: "+84 933 999 000",
    address: "01 Nguyen Hue, District 1, HCMC",
    customerNote: "Đã hoàn tiền",
    items: [
      {
        name: "Khẩu trang 4 lớp",
        meta: "Hộp 50 cái",
        qty: 1,
        priceLabel: "$15.00",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAcwAsgIceZ-i3iDrfCK8wU1cMATpaKU9tDMcAZabrpL6YgwzXlSUS1gM6T0HRblEH1yY9yilN4EfCNQaVGMfz9bzDLAzRYFvU484libnDtm6gDN20o3wwmpV4Cn7ul40y9MBaYRmpaTau4VTrOlWBV-o8fI8g4XRc-sCIuxemIGKLljYGtYP7fwWwCm29HG_Fh6e_L_UObXnFrmcDx1jnCC79BikwyowQmAJ5pcDUyMLWGIsPgY1fH-sqU9wFaMrDnoWWaiMEXDZ8k",
      },
    ],
    shipping: 0,
  },
];

const normalizeOrder = (order) => {
  const dateObj = new Date(order.date);
  return {
    ...order,
    dateObj,
    dateLabel: `${dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })} ${dateObj.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    subtotalLabel: formatCurrency(order.total - order.shipping),
    shippingLabel: formatCurrency(order.shipping),
    totalLabel: formatCurrency(order.total),
  };
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState(initialOrders.map(normalizeOrder));
  const [filters, setFilters] = useState({ query: "", status: "all" });
  const [selectedId, setSelectedId] = useState(initialOrders[0].id);

  const filteredOrders = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return orders
      .filter((order) => {
        const matchesQuery = q
          ? `${order.id} ${order.customer}`.toLowerCase().includes(q)
          : true;
        const matchesStatus =
          filters.status === "all" || order.status === filters.status;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => b.dateObj - a.dateObj);
  }, [orders, filters]);

  useEffect(() => {
    if (!filteredOrders.find((o) => o.id === selectedId)) {
      setSelectedId(filteredOrders[0]?.id || null);
    }
  }, [filteredOrders, selectedId]);

  const handleUpdateStatus = (status) => {
    if (!selectedId) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === selectedId ? { ...o, status } : o))
    );
  };

  const selectedOrder = filteredOrders.find((o) => o.id === selectedId);

  return (
    <AdminLayout activeKey="orders">
      <div className="flex-1 flex flex-col w-full max-w-[1600px] mx-auto p-6 h-[calc(100vh-40px)] overflow-hidden">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6 shrink-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Quản lý đơn hàng
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Theo dõi và xử lý đơn hàng khách đặt.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                file_download
              </span>
              Xuất dữ liệu
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors"
              onClick={() => alert("Chức năng thêm đơn mới sẽ được bổ sung")}
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Đơn mới
            </button>
          </div>
        </div>

        <OrdersToolbar
          search={filters.query}
          onSearchChange={(query) => setFilters({ ...filters, query })}
          status={filters.status}
          onStatusChange={(status) => setFilters({ ...filters, status })}
        />

        <div className="flex flex-1 gap-6 overflow-hidden min-h-0 relative">
          <div className="flex-1 min-w-0">
            <OrdersTable
              orders={filteredOrders}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
          <OrderDetailPanel
            order={selectedOrder}
            onUpdateStatus={handleUpdateStatus}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;

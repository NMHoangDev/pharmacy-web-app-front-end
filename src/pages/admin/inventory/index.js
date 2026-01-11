import React, { useMemo, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import InventoryStats from "../../../components/admin/inventory/InventoryStats";
import InventoryToolbar from "../../../components/admin/inventory/InventoryToolbar";
import InventoryTable from "../../../components/admin/inventory/InventoryTable";

const initialItems = [
  {
    id: "inv-1",
    image:
      "https://images.unsplash.com/photo-1582719478248-54e9f2afefc5?auto=format&fit=crop&w=300&q=80",
    name: "Dầu cá Omega-3",
    sku: "OMG-001",
    stock: 120,
    unit: "Hộp",
    price: 320000,
    type: "supplement",
  },
  {
    id: "inv-2",
    image:
      "https://images.unsplash.com/photo-1580281780460-82d277b0e3b3?auto=format&fit=crop&w=300&q=80",
    name: "Paracetamol 500mg",
    sku: "PCM-500",
    stock: 40,
    unit: "Vỉ",
    price: 25000,
    type: "drug",
  },
  {
    id: "inv-3",
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=300&q=80",
    name: "Máy đo huyết áp Omron",
    sku: "OMR-BP",
    stock: 8,
    unit: "Máy",
    price: 1250000,
    type: "device",
  },
  {
    id: "inv-4",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=300&q=80",
    name: "Vitamin C 1000mg",
    sku: "VITC-1K",
    stock: 15,
    unit: "Hộp",
    price: 180000,
    type: "supplement",
  },
  {
    id: "inv-5",
    image:
      "https://images.unsplash.com/photo-1584367369853-8f7c9083ba40?auto=format&fit=crop&w=300&q=80",
    name: "Khẩu trang y tế 4 lớp",
    sku: "MASK-4L",
    stock: 200,
    unit: "Hộp",
    price: 55000,
    type: "device",
  },
];

const AdminInventoryPage = () => {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.type === filter)),
    [items, filter]
  );

  const totals = useMemo(() => {
    const totalStock = items.reduce((sum, i) => sum + i.stock, 0);
    const lowStock = items.filter((i) => i.stock < 20).length;
    const value = items.reduce((sum, i) => sum + i.stock * i.price, 0);
    return { totalStock, lowStock, value };
  }, [items]);

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUpdateStock = (id, newStock) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, stock: newStock } : i))
    );
  };

  const handleSearch = (keyword) => {
    if (!keyword) return setItems(initialItems);
    const lower = keyword.toLowerCase();
    setItems((prev) =>
      prev.filter(
        (i) =>
          i.name.toLowerCase().includes(lower) ||
          i.sku.toLowerCase().includes(lower)
      )
    );
  };

  return (
    <AdminLayout activeKey="inventory">
      <div className="bg-background-light dark:bg-background-dark text-[#0d141b] dark:text-slate-100 font-display transition-colors duration-200">
        <div className="flex flex-1 justify-center py-8 px-4 sm:px-10 lg:px-16">
          <div className="layout-content-container flex flex-col max-w-[1280px] flex-1 gap-6">
            <div className="flex flex-wrap gap-2 px-1 text-sm text-[#4c739a] dark:text-slate-400">
              <span>Home</span>
              <span className="text-[#4c739a] dark:text-slate-500">/</span>
              <span>Management</span>
              <span className="text-[#4c739a] dark:text-slate-500">/</span>
              <span className="text-[#0d141b] dark:text-slate-200">
                Inventory
              </span>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4 pb-2 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col gap-1">
                <h1 className="text-[#0d141b] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">
                  Quản lý kho hàng
                </h1>
                <p className="text-sm text-[#4c739a] dark:text-slate-400">
                  Giám sát tồn kho, giá trị và nhập/xuất sản phẩm.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => alert("Nhập kho sẽ được bổ sung")}
                  className="flex items-center gap-2 cursor-pointer justify-center overflow-hidden rounded-lg h-10 px-5 bg-primary hover:bg-blue-600 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-all shadow-md hover:shadow-lg"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    download
                  </span>
                  <span>Nhập kho</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert("Xuất kho sẽ được bổ sung")}
                  className="flex items-center gap-2 cursor-pointer justify-center overflow-hidden rounded-lg h-10 px-5 border border-primary text-primary hover:bg-primary hover:text-white text-sm font-bold leading-normal tracking-[0.015em] transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    upload
                  </span>
                  <span>Xuất kho</span>
                </button>
              </div>
            </div>

            <InventoryStats stats={totals} />
            <InventoryToolbar
              activeFilter={filter}
              onFilterChange={setFilter}
              onSearch={handleSearch}
            />
            <InventoryTable
              items={filtered}
              onDelete={handleDelete}
              onUpdateStock={handleUpdateStock}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminInventoryPage;

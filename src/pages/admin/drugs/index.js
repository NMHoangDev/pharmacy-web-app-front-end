import React, { useMemo, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import DrugFilters from "../../../components/admin/drugs/DrugFilters";
import DrugTable from "../../../components/admin/drugs/DrugTable";
import DrugModal from "../../../components/admin/drugs/DrugModal";

const defaultImage =
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=300&q=80";

const initialDrugs = [
  {
    id: "d1",
    name: "Panadol Extra",
    sku: "PD-001",
    category: "Giảm đau, hạ sốt",
    price: 2500,
    priceLabel: "2,500 ₫",
    unit: "viên",
    stockLabel: "450 hộp",
    stockStatus: "in",
    rx: false,
    status: "active",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDrS_kigWy9BxLnGOHchLp2Gcm2JVjEYkeMRjMeIZwM0y-vxrrxAcPcOE55P1Xe3u3qcPJvMUQr5i-haWSz6BEe0d3438nl4he7hVQewf9yhE47Kb9ieJwyfbex_pTxiepvdpbfTxspSsEtnfhG0ofpwFsGulkRlMA727yFqxOD-yXT8hhFNYbytC-MnERl3WEvnZwak94yf3KHZfGPz2DQsmGjE-sMOH7u6cRfSZmV4q1G9a-hd4JdyYvx4_hnSgwrT-0kPHIPUExE",
  },
  {
    id: "d2",
    name: "Augmentin 625mg",
    sku: "AG-625",
    category: "Kháng sinh",
    price: 18000,
    priceLabel: "18,000 ₫",
    unit: "gói",
    stockLabel: "15 hộp",
    stockStatus: "low",
    rx: true,
    status: "active",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCuXypiX9UEk19UuLlX62Ed81bf5iM0j_B7beOSNS9b0Po3631xasrB1R1N8KiU17XbqNhKcnLwLXvLlmMoerqcyDJ7lUjbAp8PHLGGUnEhhbtfmyLGN27bfoxK501zF9CLhoZsiQO1MTnXHpCcyDlEKKqq6sSQxlyKl_fYnUurTGpFkFY1MHWl599WO31N-A6DB7fxIyVOeED2FEz9-hGT5YzAAUJyYflAi5qzM0dl5JvS5CXbNKeExk6q8tR44rWsGtemLIoGdFLh",
  },
  {
    id: "d3",
    name: "Berocca Performance",
    sku: "BR-010",
    category: "Vitamin & Khoáng chất",
    price: 85000,
    priceLabel: "85,000 ₫",
    unit: "tuýp",
    stockLabel: "Hết hàng",
    stockStatus: "out",
    rx: false,
    status: "inactive",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBIt8MB3u8OOCHANLF2CfTXKV36q0kIDmFtyRTToFpWedLMfMGNvAO_G5JlIPX_KOupdwB3n2pdSHFjen0prE_X3HOuIoPftCim5JtO6d8HomqrWU7JYGSaVjJUChCgvlNQUJyjFSf1gLkCHKvJa5EOp4pLHxiSGNT0_GqEyBb5qsiZel8GLwi0MracgKGTbeGkIrwffj58oPBD9Jz0gK_CI8D8BpyOwCsnM-aPV-4_XNhNnt2f70cGkecbre3Q9Fo1grgr2U90_n6s",
  },
  {
    id: "d4",
    name: "Efferalgan 500mg",
    sku: "EF-500",
    category: "Giảm đau, hạ sốt",
    price: 15000,
    priceLabel: "15,000 ₫",
    unit: "vỉ",
    stockLabel: "200 vỉ",
    stockStatus: "in",
    rx: false,
    status: "active",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBiuBpO1XR2VUJGCjgmC6IEoxy7UTNwCHjR-JubYWGi7_dsVlLSGhUsXX8Ln0BF_8d0cpjnZaVroyfe4hbl9J3LKuvUPl6y2rAadlg_1EExP-uqVGcOb0IrZjAwfkTMJMzPZIxCBfigIH8g2WGnQ5VPsPaTySvx_y5hpPtw9j55ZLESeQdffCvMRmBAxjfiuN6p3eaybnhWGVqupSC_NnQUv9zg2pwQ2XHbOSw4Z-Yd_Qt4UkPoUuKOe0c47My3BQ6F8kLqgXVzIvPN",
  },
];

const formatPrice = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const AdminDrugsPage = () => {
  const [drugs, setDrugs] = useState(initialDrugs);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const filteredDrugs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return drugs.filter((drug) => {
      const matchesQuery = q
        ? `${drug.name} ${drug.sku}`.toLowerCase().includes(q)
        : true;

      const matchesFilter = (() => {
        if (filter === "active") return drug.status === "active";
        if (filter === "out") return drug.stockStatus === "out";
        if (filter === "rx") return !!drug.rx;
        if (filter === "low") return drug.stockStatus === "low";
        return true;
      })();

      return matchesQuery && matchesFilter;
    });
  }, [drugs, search, filter]);

  const toggleStatus = (id) => {
    setDrugs((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "active" ? "inactive" : "active",
            }
          : item
      )
    );
  };

  const handleDelete = (id) => {
    setDrugs((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveDrug = (payload) => {
    const price = Number(payload.price) || 0;
    const stockNumber = Number(payload.stock) || 0;
    const unit = payload.unit?.trim() || "đơn vị";

    const newDrug = {
      id: `d-${Date.now()}`,
      name: payload.name.trim(),
      sku: payload.sku.trim() || `SKU-${Date.now()}`,
      category: payload.category.trim() || "Khác",
      price,
      priceLabel: formatPrice(price),
      unit,
      stockLabel: stockNumber ? `${stockNumber} ${unit}` : "0",
      stockStatus: payload.stockStatus || "in",
      rx: !!payload.rx,
      status: "active",
      image: payload.image.trim() || defaultImage,
    };

    setDrugs((prev) => [newDrug, ...prev]);
    setShowModal(false);
  };

  return (
    <AdminLayout activeKey="drugs">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Quản lý thuốc
            </h2>
            <p className="text-slate-500 mt-1 dark:text-slate-400">
              Quản lý danh mục, giá cả và tồn kho thuốc toàn hệ thống.
            </p>
          </div>
          <button
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            type="button"
            onClick={() => setShowModal(true)}
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Thêm thuốc mới
          </button>
        </div>

        <DrugFilters
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
        />

        <DrugTable
          drugs={filteredDrugs}
          onToggleStatus={toggleStatus}
          onEdit={() => alert("Tính năng chỉnh sửa sẽ được bổ sung.")}
          onDelete={handleDelete}
        />
      </div>

      <DrugModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveDrug}
      />
    </AdminLayout>
  );
};

export default AdminDrugsPage;

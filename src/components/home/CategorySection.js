import React, { memo, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../../api/httpClients";
import "../../styles/storefront-premium.css";

const pickIcon = (name) => {
  const n = String(name || "").toLowerCase();
  if (n.includes("vitamin") || n.includes("tpcn")) return "nutrition";
  if (n.includes("mẹ") || n.includes("bé") || n.includes("em")) return "child_care";
  if (n.includes("da") || n.includes("liễu")) return "dermatology";
  if (n.includes("tim") || n.includes("mạch")) return "ecg_heart";
  if (n.includes("giảm đau") || n.includes("đau")) return "healing";
  return "pill";
};

const fetchCategories = async () => {
  const res = await publicApi.get("/api/catalog/public/categories");
  const list = Array.isArray(res?.data) ? res.data : [];
  return list.slice(0, 6);
};

const CategorySkeleton = () => (
  <div className="storefront-soft-card rounded-[26px] p-5">
    <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-100" />
    <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
    <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-slate-100" />
  </div>
);

const CategorySection = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["home", "categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,
  });

  const categories = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  return (
    <section className="py-6 sm:py-8">
      <div className="storefront-container mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="storefront-card rounded-[32px] p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
                Danh mục nổi bật
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                Chọn nhanh theo nhu cầu thường gặp
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Bố cục danh mục được làm gọn để người dùng mới cũng có thể nhận ra
                ngay khu vực mình cần, thay vì phải tìm trong quá nhiều nhóm.
              </p>
            </div>

            <Link
              to="/medicines"
              className="storefront-interactive inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              Xem toàn bộ danh mục
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </Link>
          </div>

          {isError ? (
            <div className="mt-5 rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              Không tải được danh mục lúc này. Bạn vẫn có thể vào trang sản phẩm để
              duyệt toàn bộ thuốc và hàng chăm sóc sức khỏe.
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {(isLoading ? Array.from({ length: 6 }) : categories).map((category, index) => {
              if (isLoading) {
                return <CategorySkeleton key={index} />;
              }

              const name = category?.name || category?.title || "Danh mục";

              return (
                <button
                  key={category?.id || name}
                  type="button"
                  onClick={() => navigate("/medicines")}
                  className="storefront-soft-card storefront-interactive rounded-[26px] p-5 text-left focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                    <span className="material-symbols-outlined text-[24px]">
                      {pickIcon(name)}
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-black text-slate-900 sm:text-base">
                    {name}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Mở danh sách phù hợp ngay
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(CategorySection);

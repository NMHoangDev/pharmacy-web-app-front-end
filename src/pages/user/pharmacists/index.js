import React, { useEffect, useMemo, useState, useCallback } from "react";
import EmptyState from "../../../components/EmptyState";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import PharmacistsBreadcrumbs from "../../../components/pharmacists/PharmacistsBreadcrumbs";
import PharmacistsFilters from "../../../components/pharmacists/PharmacistsFilters";
import OnlineNowSection from "../../../components/pharmacists/OnlineNowSection";
import SortBar from "../../../components/pharmacists/SortBar";
import PharmacistsGrid from "../../../components/pharmacists/PharmacistsGrid";
import PharmacistsPagination from "../../../components/pharmacists/PharmacistsPagination";
import { publicApi as api } from "../../../api/httpClients";
import "../../../styles/storefront-premium.css";

const specialtyLabels = {
  clinical: "Dược lâm sàng",
  pediatric: "Dược nhi",
  supplement: "Tư vấn TPCN",
  cosmetic: "Dược mỹ phẩm",
  obstetric: "Dược sản phụ",
  retail: "Dược bán lẻ",
  hospital: "Dược bệnh viện",
  research: "Nghiên cứu",
  online: "Tư vấn trực tuyến",
};

const defaultAvatar =
  "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=300&q=80";

const defaultFilters = {
  specialty: "all",
  mode: "all",
  experience: "all",
  ratingGte: null,
};

const PharmacistsPage = () => {
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [list, setList] = useState([]);
  const [online, setOnline] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const loadPharmacists = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");
      try {
        const queryParams = { verified: "true" };
        if (appliedFilters.specialty !== "all") {
          queryParams.specialty = appliedFilters.specialty;
        }
        if (appliedFilters.mode !== "all") {
          queryParams.mode = appliedFilters.mode;
        }
        if (appliedFilters.experience !== "all") {
          queryParams.experience = appliedFilters.experience;
        }
        if (appliedFilters.ratingGte != null) {
          queryParams.ratingGte = String(appliedFilters.ratingGte);
        }

        const response = await api.get("/api/pharmacists", {
          params: queryParams,
          signal,
        });

        const payload = response.data;
        setTotal(payload?.totalElements ?? 0);
        setList(payload?.content ?? []);

        const onlineResponse = await api.get("/api/pharmacists/online", {
          params: { limit: 4 },
          signal,
        });
        const onlinePayload = onlineResponse.data;
        setOnline(onlinePayload ?? []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Khong the tai duoc si");
        }
      } finally {
        setLoading(false);
      }
    },
    [appliedFilters],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadPharmacists(controller.signal);
    return () => controller.abort();
  }, [loadPharmacists, reloadKey]);

  const handleReload = useCallback(
    () => setReloadKey((value) => value + 1),
    [],
  );
  const handleApply = useCallback(
    () => setAppliedFilters(draftFilters),
    [draftFilters],
  );
  const handleReset = useCallback(() => {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  }, []);

  const mappedList = useMemo(
    () =>
      list.map((item) => ({
        id: item.id,
        name: item.name,
        tag: specialtyLabels[item.specialty] || item.specialty || "Duoc si",
        experience: `${item.experienceYears ?? 0} nam KN`,
        rating: item.rating ?? 0,
        reviews: item.reviewCount ?? 0,
        status: (item.status || "offline").toLowerCase(),
        badge: item.verified ? "Đã xác minh chứng chỉ" : "Chờ xác minh",
        image: item.avatarUrl || defaultAvatar,
      })),
    [list],
  );

  const mappedOnline = useMemo(
    () =>
      online.map((item) => ({
        id: item.id,
        name: item.name,
        specialty:
          specialtyLabels[item.specialty] || item.specialty || "Duoc si",
        image: item.avatarUrl || defaultAvatar,
        status: (item.status || "online").toLowerCase(),
      })),
    [online],
  );

  return (
    <div className="storefront-shell min-h-screen flex flex-col">
      <Header />

      <main className="storefront-container flex-1 pt-3 pb-10">
        <div className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
          <PharmacistsBreadcrumbs />

          <section className="storefront-hero storefront-fade-up rounded-[34px] border border-white/70 px-5 py-8 sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Tư vấn dược sĩ
                </div>
                <h1 className="mt-3 text-4xl font-extrabold leading-tight text-slate-900">
                  Chọn dược sĩ phù hợp để được tư vấn
                </h1>
                <p className="mt-3 max-w-3xl text-base text-slate-600">
                  Danh sách dược sĩ đã xác minh, có thể tư vấn nhanh qua chat,
                  video hoặc tại quầy thuốc.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-1 flex flex-col gap-5 lg:flex-row">
            <div className="w-full lg:w-72">
              <PharmacistsFilters
                filters={draftFilters}
                onChange={setDraftFilters}
                onApply={handleApply}
                onReset={handleReset}
              />
            </div>
            <div className="flex w-full flex-1 flex-col gap-4">
              <OnlineNowSection pharmacists={mappedOnline} />
              <SortBar total={total} />
              {loading ? (
                <div className="storefront-card rounded-[24px] px-4 py-4 text-sm text-slate-500">
                  Đang tải dược sĩ...
                </div>
              ) : mappedList.length === 0 ? (
                <div className="storefront-card rounded-[24px] p-6">
                  <EmptyState
                    title="Không tìm thấy dược sĩ phù hợp"
                    subtitle="Hiện chưa có dược sĩ nào sẵn sàng tư vấn."
                    actionLabel="Tải lại"
                    onAction={handleReload}
                  />
                </div>
              ) : (
                <PharmacistsGrid pharmacists={mappedList} />
              )}
              <PharmacistsPagination
                total={total}
                showing={mappedList.length}
              />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PharmacistsPage;

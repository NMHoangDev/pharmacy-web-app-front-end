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
import { authApi as api } from "../../../api/httpClients";

const specialtyLabels = {
  clinical: "Dược lâm sàng",
  pediatric: "Dược nhi",
  supplement: "Tư vấn TPCN",
  cosmetic: "Dược mỹ phẩm",
  obstetric: "Dược thai sản",
  retail: "Dược bán lẻ",
  hospital: "Dược bệnh viện",
  research: "Nghiên cứu",
  online: "Tư vấn trực tuyến",
};

const defaultAvatar =
  "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=300&q=80";

const PharmacistsPage = () => {
  const defaultFilters = {
    specialty: "all",
    mode: "all",
    experience: "all",
    ratingGte: null,
  };

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
        const queryParams = {
          verified: "true",
        };
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
          setError(err.message || "Không thể tải dược sĩ");
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

  const handleReload = useCallback(() => setReloadKey((v) => v + 1), []);

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
        tag: specialtyLabels[item.specialty] || item.specialty || "Dược sĩ",
        experience: `${item.experienceYears ?? 0} năm KN`,
        rating: item.rating ?? 0,
        reviews: item.reviewCount ?? 0,
        status: (item.status || "offline").toLowerCase(),
        badge: item.verified ? "Đã xác minh chứng chỉ" : "Chờ xác minh",
        image: item.avatarUrl || defaultAvatar,
        specialty: item.specialty,
        verifiedText: item.verified ? "Đã xác minh chứng chỉ" : "Chờ xác minh",
        workingHours: item.workingHours,
        workingDays: item.workingDays?.join(", "),
        languages: item.languages?.join(", "),
        education: item.education,
      })),
    [list],
  );

  const mappedOnline = useMemo(
    () =>
      online.map((item) => ({
        id: item.id,
        name: item.name,
        specialty:
          specialtyLabels[item.specialty] || item.specialty || "Dược sĩ",
        image: item.avatarUrl || defaultAvatar,
        status: (item.status || "online").toLowerCase(),
        verifiedText: item.verified ? "Đã xác minh chứng chỉ" : "Chờ xác minh",
        workingHours: item.workingHours,
        workingDays: item.workingDays?.join(", "),
        languages: item.languages?.join(", "),
        education: item.education,
      })),
    [online],
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header />

      <main className="flex-1 pt-3 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <PharmacistsBreadcrumbs />

          <section className="flex flex-col lg:flex-row gap-5 mt-1">
            <div className="w-full lg:w-72">
              <PharmacistsFilters
                filters={draftFilters}
                onChange={setDraftFilters}
                onApply={handleApply}
                onReset={handleReset}
              />
            </div>
            <div className="w-full flex-1 flex flex-col gap-4">
              {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}
              <OnlineNowSection pharmacists={mappedOnline} />
              <SortBar total={total} />
              {loading ? (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                  Đang tải dược sĩ...
                </div>
              ) : mappedList.length === 0 ? (
                <EmptyState
                  title={"Không có dược sĩ"}
                  subtitle={"Hiện chưa có dược sĩ nào sẵn sàng tư vấn."}
                  actionLabel={"Tải lại"}
                  onAction={handleReload}
                />
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

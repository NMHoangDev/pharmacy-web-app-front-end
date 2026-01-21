import React, { useEffect, useMemo, useState } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import PharmacistsBreadcrumbs from "../../../components/pharmacists/PharmacistsBreadcrumbs";
import PharmacistsFilters from "../../../components/pharmacists/PharmacistsFilters";
import OnlineNowSection from "../../../components/pharmacists/OnlineNowSection";
import SortBar from "../../../components/pharmacists/SortBar";
import PharmacistsGrid from "../../../components/pharmacists/PharmacistsGrid";
import PharmacistsPagination from "../../../components/pharmacists/PharmacistsPagination";

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
  const [filters, setFilters] = useState({
    specialty: "all",
    mode: "all",
    experience: "all",
  });
  const [list, setList] = useState([]);
  const [online, setOnline] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (filters.specialty !== "all") {
          params.append("specialty", filters.specialty);
        }
        if (filters.mode !== "all") {
          params.append("mode", filters.mode);
        }
        if (filters.experience !== "all") {
          params.append("experience", filters.experience);
        }
        params.append("verified", "true");

        const response = await fetch(`/api/pharmacists?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Không thể tải danh sách dược sĩ");
        }
        const payload = await response.json();
        setTotal(payload.totalElements ?? 0);
        setList(payload.content ?? []);

        const onlineResponse = await fetch("/api/pharmacists/online?limit=4", {
          signal: controller.signal,
        });
        if (onlineResponse.ok) {
          const onlinePayload = await onlineResponse.json();
          setOnline(onlinePayload ?? []);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Không thể tải dược sĩ");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => controller.abort();
  }, [filters]);

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
    <div className="min-h-screen bg-[#f4f7fb] dark:bg-slate-950 flex flex-col">
      <Header />

      <main className="flex-1 pt-4 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <PharmacistsBreadcrumbs />

          <section className="flex flex-col lg:flex-row gap-6 mt-2">
            <div className="w-full lg:w-1/4">
              <PharmacistsFilters
                filters={filters}
                onChange={setFilters}
                onReset={() =>
                  setFilters({
                    specialty: "all",
                    mode: "all",
                    experience: "all",
                  })
                }
              />
            </div>
            <div className="w-full lg:w-3/4 flex flex-col gap-5">
              {error ? (
                <div className="rounded-lg bg-red-50 text-red-600 text-sm px-4 py-3">
                  {error}
                </div>
              ) : null}
              <OnlineNowSection pharmacists={mappedOnline} />
              <SortBar total={total} />
              {loading ? (
                <div className="text-sm text-slate-500">
                  Đang tải dược sĩ...
                </div>
              ) : (
                <PharmacistsGrid pharmacists={mappedList} />
              )}
              <PharmacistsPagination />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PharmacistsPage;

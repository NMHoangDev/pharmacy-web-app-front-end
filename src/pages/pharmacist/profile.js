import React, { useCallback, useEffect, useState } from "react";
import PharmacistSidebar from "../../components/phamacist_POS/PharmacistSidebar";
import PharmacistProfileForm from "../../components/pharmacist-profile/PharmacistProfileForm";
import { useBranches } from "../../hooks/useBranches";
import {
  getMyPharmacistProfile,
  updateMyPharmacistProfile,
} from "../../api/pharmacistApi";

const PharmacistProfilePage = () => {
  const { branches } = useBranches();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyPharmacistProfile();
      setProfile(data);
    } catch (err) {
      if (err?.status === 404) {
        setProfile(null);
      } else {
        setError(err.message || "Không thể tải hồ sơ dược sĩ.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const data = await updateMyPharmacistProfile(payload);
      setProfile(data);
      setSuccess("Hồ sơ dược sĩ đã được cập nhật.");
    } catch (err) {
      setError(err.message || "Không thể cập nhật hồ sơ dược sĩ.");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] font-display text-slate-900">
      <PharmacistSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-8">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Mở điều hướng"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
          <span className="material-symbols-outlined">badge</span>
        </div>
        <div>
          <h1 className="text-lg font-bold">Hồ sơ dược sĩ</h1>
          <p className="text-xs text-slate-500">
            Cập nhật thông tin hiển thị cho khách hàng và hệ thống đặt lịch.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-4 p-4 md:p-8">
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
            Đang tải hồ sơ dược sĩ...
          </div>
        ) : (
          <PharmacistProfileForm
            title="Quản lý hồ sơ cá nhân"
            subtitle="Các thay đổi ở đây sẽ xuất hiện trong danh sách dược sĩ, trang đặt lịch và hồ sơ chi tiết của bạn."
            initialProfile={profile}
            branches={branches}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="Lưu hồ sơ"
            readOnlyManagedFields
          />
        )}
      </main>
    </div>
  );
};

export default PharmacistProfilePage;

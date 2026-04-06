import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../components/admin/AdminLayout";
import AdminPageContainer from "../../../components/common/AdminPageContainer";
import PharmacistProfileForm from "../../../components/pharmacist-profile/PharmacistProfileForm";
import { useBranches } from "../../../hooks/useBranches";
import {
  getAdminPharmacist,
  updateAdminPharmacist,
} from "../../../api/pharmacistApi";

const AdminPharmacistDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { branches } = useBranches();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const data = await getAdminPharmacist(id);
      setProfile(data);
    } catch (err) {
      setError(err.message || "Không thể tải hồ sơ dược sĩ.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSubmit = async (payload) => {
    if (!id) return;
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const data = await updateAdminPharmacist(id, payload);
      setProfile(data);
      setSuccess("Đã cập nhật hồ sơ dược sĩ.");
    } catch (err) {
      setError(err.message || "Không thể cập nhật hồ sơ dược sĩ.");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout activeKey="pharmacists">
      <AdminPageContainer>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Hồ sơ dược sĩ
            </h1>
            <p className="text-sm text-slate-500">
              Quản trị viên có thể cập nhật đầy đủ thông tin hồ sơ, chi nhánh và
              lịch làm việc của dược sĩ.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/pharmacists")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Quay lại danh sách
          </button>
        </div>

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
            title={profile?.name || "Chi tiết dược sĩ"}
            subtitle="Cập nhật toàn bộ hồ sơ hiển thị ở trang admin, danh sách dược sĩ, trang đặt lịch và hồ sơ cá nhân."
            initialProfile={profile}
            branches={branches}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="Lưu cập nhật"
          />
        )}
      </AdminPageContainer>
    </AdminLayout>
  );
};

export default AdminPharmacistDetailPage;

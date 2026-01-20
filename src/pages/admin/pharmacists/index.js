import React, { useMemo, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import AdminPharmacistFilters from "../../../components/admin/pharmacists/AdminPharmacistFilters";
import AdminPharmacistGrid from "../../../components/admin/pharmacists/AdminPharmacistGrid";

const initialPharmacists = [
  {
    id: "PHM-001",
    name: "DS. Nguyễn Văn A",
    specialty: "clinical",
    experience: 8,
    status: "online",
    verified: true,
    availability: "Sẵn sàng tư vấn",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAVa9Jnv_qzIYpL7iVXEZHfqXxTBSELqC014lH6GiwmkTy_g3uZK9lHP51f5cqmAwDPCTNb6-Mqnbx5YpQHv9MML-lyUWYqsv323OIjdXbXsrqwgktPWSSezyUBjePblv7Kyr4UBpZeJxEu3bLJfWZ4qn_JHi32lRDyPcjQzn3cMh6lT0ftCWjMUYuGUsmj73hhBKIMFqwJ4gtVp4f0DGR1tiYBlPQGQ76vlqn2tqATQZ3mTAvnFH0GOsHLvTV5QrPQckLqpJKQqf8m",
  },
  {
    id: "PHM-023",
    name: "DS. Trần Thị B",
    specialty: "retail",
    experience: 3,
    status: "offline",
    verified: true,
    availability: "Truy cập 2 giờ trước",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCUpKMgvWewRpZe21bT6CFobu5Zv6ork7reqasj2RF4XSy_cjpmZKvjR6PgEoULYFCrYdvSuP8zRh-1NDQ_XTSXYnsQbRJ_9Nmse1WayYQUComfL8fu0ar1wpy2seneC-uglT6UZpi7DjheYC6EXH7z26LA_p1kr2vQHXS9_HnxH2evSya-Duhd_Z9KxrfZFihAW6pU_EUeKr6iNpqrWGYfJEDo2zEfcIrWKXcl8_qEBmlsIfZRwr0D2SDRguRQG7y9rRIQuRcgfoHx",
  },
  {
    id: "PHM-104",
    name: "DS. Lê Văn C",
    specialty: "hospital",
    experience: 12,
    status: "online",
    verified: true,
    availability: "Đang bận",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAPo397wHQuqDAMHbBAXbOcv5Qw6tbA2o33gjShSwdtHy7ddhgtdM8On2uHeN3DK2dZ4QAG5csiRFpexLB57sp70A1fpdKNy6gFg2ZjYvXfSntMuYOoO0acPrGQpR9RuzCq5OAWFQmL5ooLr5aoOxEHHSgJ2ry9XH1kUkUE-dyWaIZoRfLgGn_OM9VaVOxJSncTiKcFlrmMqIeeHrh3SQWX08YMMzIAjUDZZprDE_UeT5FhHkkytz0s8_IXQksV2gwbi8gEhwoXegnd",
  },
  {
    id: "PHM-152",
    name: "DS. Phạm Thị D",
    specialty: "research",
    experience: 5,
    status: "online",
    verified: false,
    availability: "Sẵn sàng tư vấn",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAQyzKPftbVr6E-4vLbWvIa7w5oxYL7QN8rnbjxioG7N-n_fIrlc3rb_IbY6TOrIw39qC1Q4Xe9pmUe8kRwkhes5xfsYGLiVel5B7Ic5BCL0djImtxerY3gAoJqGDxDO2XnxU9dKsZYhY0XYrhT4rz0LsG6PqQkQ8PpLwOtvexknt0yYdxKQmjAbRDC0aAk0jIftO98sqSuVXTWMGoCuyoCYA4D2xxySQgQOlB145o950wp9rAAPReQd22MVoTYjxfLsvZFOVdPkBO3",
  },
  {
    id: "PHM-099",
    name: "DS. Hoàng Văn E",
    specialty: "clinical",
    experience: 15,
    status: "offline",
    verified: true,
    availability: "Truy cập hôm qua",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAb03ZdDj_qCKYIbrSLGbf8QWKcjDaQD1hm05ucqas9ns9AGSlTDg6Fkty1zCSIpus5SJ40qnQn8VxBdRSwlEW6f25-QN8YpsvUjTSrJ_-5yG5_4kBf1xQK4VIO2dSNSdkzAi_CXX3ujxKBDQDLRRXyR-Xi8pCbxALP1w_bW3P4a7rD1bPA43_y6ESoe0EMcmzOz20fT6GRw42b1TvbqlTHQx2WfTTdALsJmZoIFXS5lySUG0VLtjaR_497an8qFOH1-1gR4CPHHqUK",
  },
  {
    id: "PHM-120",
    name: "DS. Ngô Thị F",
    specialty: "online",
    experience: 4,
    status: "online",
    verified: true,
    availability: "Sẵn sàng tư vấn",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBsyjVpyiuvs_PzaaFdGcgfV3lmf7UQNKHJ82nvKI8wGL9-a717PsisXjYtCNLvQSu-cBlbfcvDqUpr_6TmAG8UZ-8oPVQWblAeye6qM6vN0HH2BIU6cI2ZQY3dd7wICB1nyNct1Mu6nF3m7YLBQuzf7He0aw8X_brwDbkG5PtAZJao2CGlQ-luPbBVX_qiiUOj417i9HvfcJW3ffp2OX5IpJDX9Ai2A0QZ_H9XrdHwJQRmNDi0bXLhdgrYv-XHanYztBStvl00yjzA",
  },
];

const AdminPharmacistsPage = () => {
  const [pharmacists, setPharmacists] = useState(initialPharmacists);
  const [filters, setFilters] = useState({
    query: "",
    specialty: "all",
    status: "all",
    verification: "all",
  });

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return pharmacists.filter((p) => {
      const matchesQuery = q
        ? p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
        : true;
      const matchesSpec =
        filters.specialty === "all" || p.specialty === filters.specialty;
      const matchesStatus =
        filters.status === "all" || p.status === filters.status;
      const matchesVerify =
        filters.verification === "all" ||
        (filters.verification === "verified" ? p.verified : !p.verified);
      return matchesQuery && matchesSpec && matchesStatus && matchesVerify;
    });
  }, [pharmacists, filters]);

  const toggleStatus = (id) => {
    setPharmacists((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "online" ? "offline" : "online" }
          : p
      )
    );
  };

  const toggleVerify = (id) => {
    setPharmacists((prev) =>
      prev.map((p) => (p.id === id ? { ...p, verified: !p.verified } : p))
    );
  };

  return (
    <AdminLayout activeKey="pharmacists">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light dark:bg-background-dark">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
                Quản lý dược sĩ
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                Theo dõi trạng thái, chuyên môn và xác thực của đội ngũ dược sĩ.
              </p>
            </div>
            <button
              type="button"
              onClick={() => alert("Chức năng thêm dược sĩ sẽ được bổ sung")}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all active:scale-95 w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="text-sm font-bold">Thêm dược sĩ</span>
            </button>
          </div>

          <AdminPharmacistFilters
            filters={filters}
            onChange={setFilters}
            onReset={() =>
              setFilters({
                query: "",
                specialty: "all",
                status: "all",
                verification: "all",
              })
            }
          />

          <AdminPharmacistGrid
            pharmacists={filtered}
            onToggleStatus={toggleStatus}
            onToggleVerify={toggleVerify}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPharmacistsPage;

import React, { useMemo, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import ContentToolbar from "../../../components/admin/content/ContentToolbar";
import ContentTable from "../../../components/admin/content/ContentTable";
import ContentQuickDraft from "../../../components/admin/content/ContentQuickDraft";
import ContentStats from "../../../components/admin/content/ContentStats";

const articlesSeed = [
  {
    id: "c-1",
    title: "5 mẹo phòng tránh cúm mùa hiệu quả",
    category: "Sức khỏe chung",
    readTime: "5 phút đọc",
    status: "published",
    author: "Dr. Minh",
    authorInitials: "DM",
    updatedAt: "2 giờ trước",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDmGqV-2YcLtcd12F2p6fIdFCk8iIf_vBcwj3Lw4S3IKVGfRgGt1fzFYVrIKF_mR9_U7R7m5MAB-5jNo4zQSgrdm2fnVCUN4iBVBrsKNbAfn5KMVlv9MAQ7uvXwy59vwi35VZzGZIdoY3rnmWLjsB1RiyiRQ1xKz6k11pj9ZyhUft8Fqq_zzioDrgazq0_yxO9pwdjkUAo1M3jv2sF6cV-69uOVnZeD7VmcP0jKn0Jl78SySofxwOSc0CfRHmg_r5v_uY4K13Z3GCez",
  },
  {
    id: "c-2",
    title: "Top 10 thực phẩm giàu Vitamin C",
    category: "Dinh dưỡng",
    readTime: "Đang soạn thảo",
    status: "draft",
    author: "DS. Lan",
    authorInitials: "DL",
    updatedAt: "14/10/2023",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDJaLHzH-zEFUomc0_Z3LyT40CnGnTI8phapZcwzpfr-VNeVMiYBwpqWBSlorPWHGrcS3e5SJvmup4ThTXjvaeY-fo-fOj43O6Bk0j2xtd5WdGJsvRBYCNe0J1PCUI2StBqUdv-nhBLwpELoApe_IzXk72x3dfEKFMoEgWHWQNVFoXbJz5Evprl_A6RdbhtDcahsdfS6ijTblIoJVAaVBActBquOtId3H_QLa6Gy1MyZWcK4UlUIWMHQVyk2u5wkHZvE_DHKme6pnfm",
  },
  {
    id: "c-3",
    title: "Lịch tiêm chủng mở rộng cho trẻ em 2024",
    category: "Tin tức y tế",
    readTime: "8 phút đọc",
    status: "scheduled",
    author: "Admin",
    authorInitials: "AD",
    updatedAt: "12/10/2023",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBtjT18FKJwdN8Qm9XShAN62BbXM-aAc0zKUPJvRjGbSIwdI0XNlL7bQV7fGMXFjC4FqPd2NcBnCWUt1vrbOUZ8JHI9uKt-mla8jxGksJbAW7DKAKPqNxB5v-9Qe2lhJbGXclT9jEt04zwVLWTy4PxNj8tw6pmV7APEsCQCr0BNhVlDq2YHSXtYTBgeZw-EV-HP3qybsbikGDJVfXFueiyj9KVFUNdU7-5oMnWsMLcKjV9Kiugg6BqX-uJ_yLJcDbTC_vahjhCHDGff",
  },
  {
    id: "c-4",
    title: "Khuyến mãi tháng 11: Mua 1 tặng 1",
    category: "Sự kiện • Banner",
    readTime: "Banner",
    status: "published",
    author: "Marketing",
    authorInitials: "MK",
    updatedAt: "01/10/2023",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDHM_tzRr52qEICgnS42c--VKbzcItXymil-rQfX5J-bV6vV8Axq8sPQRNOqS6a6QWk32EJ_fmqzf6t8DAMwO3JwHskU1BAb3ykiGF-nFULbRDIg23CXniSqqkPb73DNekPq6U3RNRkoEeMv_xlEcaFFa8pgj535OAjcRBwpAZOKraVMGWZ25_R-SWHNO2HkNTdKg37iWSyra5jd_4f10tYhCXiE-yllh9cVm_533Z6MIuKW2-bjEyVI3C01OUlEliTnqPZkAMDLqDE",
  },
];

const AdminContentPage = () => {
  const [articles, setArticles] = useState(articlesSeed);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [author, setAuthor] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((item) => {
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q);
      const matchStatus = status === "all" || item.status === status;
      const matchAuthor =
        author === "all" || item.author.toLowerCase().includes(author);
      return matchQuery && matchStatus && matchAuthor;
    });
  }, [articles, query, status, author]);

  const stats = useMemo(() => {
    const published = articles.filter((a) => a.status === "published").length;
    const scheduled = articles.filter((a) => a.status === "scheduled").length;
    const draft = articles.filter((a) => a.status === "draft").length;
    return { published, scheduled, draft };
  }, [articles]);

  const handlePreview = (item) => alert(`Xem trước: ${item.title}`);
  const handleEdit = (item) => alert(`Chỉnh sửa: ${item.title}`);
  const handleDelete = (item) => {
    if (window.confirm(`Xóa bài viết \"${item.title}\"?`)) {
      setArticles((prev) => prev.filter((a) => a.id !== item.id));
    }
  };

  return (
    <AdminLayout activeKey="content">
      <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                  Quản lý nội dung
                </h1>
                <p className="text-text-secondary dark:text-gray-400 text-base font-normal max-w-2xl">
                  Quản lý bài viết sức khỏe, banner quảng cáo và các trang thông
                  tin tĩnh trên website nhà thuốc.
                </p>
              </div>
              <button
                type="button"
                className="flex items-center justify-center gap-2 h-10 px-5 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
                onClick={() => alert("Tạo mới bài viết (mock)")}
              >
                <span className="material-symbols-outlined text-[20px]">
                  add
                </span>
                <span>Tạo mới</span>
              </button>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-[#e7edf3] dark:border-gray-800 overflow-hidden">
              <div className="border-b border-[#e7edf3] dark:border-gray-700 px-6">
                <div className="flex gap-8 overflow-x-auto">
                  <button
                    className="flex items-center justify-center border-b-[3px] border-transparent text-text-secondary dark:text-gray-400 hover:text-primary py-4 px-2 transition-colors whitespace-nowrap"
                    type="button"
                  >
                    <p className="text-sm font-bold tracking-[0.015em]">
                      Banner
                    </p>
                  </button>
                  <button
                    className="flex items-center justify-center border-b-[3px] border-primary text-primary py-4 px-2 transition-colors whitespace-nowrap"
                    type="button"
                  >
                    <p className="text-sm font-bold tracking-[0.015em]">
                      Bài viết
                    </p>
                  </button>
                  <button
                    className="flex items-center justify-center border-b-[3px] border-transparent text-text-secondary dark:text-gray-400 hover:text-primary py-4 px-2 transition-colors whitespace-nowrap"
                    type="button"
                  >
                    <p className="text-sm font-bold tracking-[0.015em]">
                      Trang tĩnh
                    </p>
                  </button>
                </div>
              </div>

              <ContentToolbar
                query={query}
                status={status}
                author={author}
                onQueryChange={setQuery}
                onStatusChange={setStatus}
                onAuthorChange={setAuthor}
              />

              <ContentTable
                articles={filtered}
                onPreview={handlePreview}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />

              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                <p className="text-sm text-text-secondary dark:text-gray-400">
                  Hiển thị{" "}
                  <span className="font-medium text-text-main dark:text-white">
                    1
                  </span>{" "}
                  đến
                  <span className="font-medium text-text-main dark:text-white">
                    {" "}
                    {filtered.length}
                  </span>{" "}
                  trong số
                  <span className="font-medium text-text-main dark:text-white">
                    {" "}
                    {articles.length}
                  </span>{" "}
                  kết quả
                </p>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 text-sm font-medium rounded-md border border-gray-200 dark:border-gray-700 text-text-secondary dark:text-gray-400 disabled:opacity-50"
                    type="button"
                    disabled
                  >
                    Trước
                  </button>
                  <button
                    className="px-3 py-1 text-sm font-medium rounded-md bg-primary text-white"
                    type="button"
                  >
                    1
                  </button>
                  <button
                    className="px-3 py-1 text-sm font-medium rounded-md border border-gray-200 dark:border-gray-700 text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                    type="button"
                  >
                    2
                  </button>
                  <button
                    className="px-3 py-1 text-sm font-medium rounded-md border border-gray-200 dark:border-gray-700 text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                    type="button"
                  >
                    Tiếp
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ContentQuickDraft />
              <ContentStats
                published={stats.published}
                pending={stats.scheduled}
                drafts={stats.draft}
              />
            </div>

            <div className="flex justify-center pb-6">
              <p className="text-text-secondary dark:text-gray-400 text-sm">
                © 2024 Pharmacy Admin Portal. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminContentPage;

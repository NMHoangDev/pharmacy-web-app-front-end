import React from "react";
import { useNavigate } from "react-router-dom";

const pharmacists = [
  {
    id: 1,
    name: "DS. Nguyễn Thị Mai",
    tag: "Dược lâm sàng",
    experience: "5 năm KN",
    rating: 4.9,
    reviews: 142,
    status: "online",
    badge: "Đã xác minh chứng chỉ",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD_hzgAKqB0MuZRr2-JN6pmes7C0pOe64NgG2v_lSM5i0H-2r5DjhKcQFaWA0-wlII8Igoq9IEo58i1vzvMxiLeLJ-WvTsBRGpyDH1ChCIJB0Y3uA_gB2QqEhalyhjgYxR76ENK-lXEl6QHiVFrSErj-A8Mgbom03lFmqyqiiTUtnYaW1LWD4Z-00YwfGxZC3OaLQk22v0oQSLZa9nDg1ElYRqz2b9XWnf4IERY242O0frVq64vUNdZpV-RVfQWn78Jju_2SRsR2FQE",
  },
  {
    id: 2,
    name: "DS. Trần Văn Bình",
    tag: "Dược Nhi",
    experience: "8 năm KN",
    rating: 4.8,
    reviews: 98,
    status: "offline",
    badge: "Đã xác minh chứng chỉ",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD2NHaNy2oCo6rZX4vt8YTQeNmN310ZAiDHZS-tGCmi2K1XrhoHT88o_rmiMlzJoBr5mljFCqwQG5bSLzB2ZHPoFK0EF_BEObDqpAd9leHvQOdyjuqbexG0hb6_hjhnY4Dx1GDu_So3P1d_BaesL4HSjyoHn7zzjBFweH0lNzd_NYGhmf9FJijdgL_dI6uEYshswMDcfAgq-S63t1-d0nptWQGnaRYwd91moYhwjyyQGTLm4TSiZfFzu3TuXy-5oRudYGJevrIQdtPm",
  },
  {
    id: 3,
    name: "DS. Lê Thị Thanh",
    tag: "TPCN",
    experience: "3 năm KN",
    rating: 5.0,
    reviews: 45,
    status: "online",
    badge: "Đã xác minh chứng chỉ",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAkYYWoaWQ8FpuEVw38NTkhpZAnY1c1b6ZGnnHWIc9aSrXMkcpITy94LTrgAYOO5oPT4YAmKvi3BSAVvRhEt39On5BWKmOY4TAtEaXSR-BWfDR473W4qNb8GCjlIHSOAud_galWWdxkMz7o-LZ784HvJII3lNni5s5CDv0rsCmda1AC-laAAq8ri-nMQMOALcXjkoTNtGBlgRtINoVlRaKVALkq1PXIaQSnmWwQjvUxKQ87cdJkhpZ9pnaawT5DKQwYWZmXmYLGutz1",
  },
  {
    id: 4,
    name: "DS. Phạm Văn Dũng",
    tag: "Dược Lý",
    experience: "10 năm KN",
    rating: 4.7,
    reviews: 210,
    status: "online",
    badge: "Đã xác minh chứng chỉ",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCy6LKqVNa00v1nTHxSTt0mKXwkwuQHl9pbH_BilpU0tM2b3dWcfzU84ylgQxglkaNhptg89uM3u3ucj4DR8CsSTfm_h7eEnv71vfjIGjeVOBfJJTZAoQ9CxeAYuI11t8GnNcWXc6upHM5M23wgBj-yX9uIHUkSunhj9U-bCLRtp3hoYqoqry-EC_Mg-J9Ls7DhYiwL8Abf4vjw0XnPB27OFSXSHD1ZdbysMX4t0nwgJbeJZ3JF0pFgIvFEVN9g_E_RPElUf_F9PJ-g",
  },
  {
    id: 5,
    name: "DS. Nguyễn Hoàng Anh",
    tag: "Dược Sĩ",
    experience: "4 năm KN",
    rating: 4.5,
    reviews: 56,
    status: "online",
    badge: "Đã xác minh chứng chỉ",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDiDm4S9pusKByH7MyK1EyHwurRvUT-b5IjIKYdy8F7i0tIxsjhejoFsjloXxVNZB0VbJjaTLZpmiUxdf5ZrWuauh1MgSGf19XHUuINF-3csubjRlT1OccRGXuit9L9X2UegXrXdCD_bfgO1UcbV6GzyWcMwtRN1Ycg4n-dSjgTh4XpkrSYeKhX1goRWfKC_C06n_9qoNt72au9fzRWToOZy-FGhOMXyMJhazGYcqZSIGOdcDPDFZu2J9dFtnB5yG4G9l5HI5RQpTtT",
  },
  {
    id: 6,
    name: "DS. Đoàn Thị Bích",
    tag: "Mỹ Phẩm",
    experience: "2 năm KN",
    rating: 4.6,
    reviews: 32,
    status: "offline",
    badge: "Đã xác minh chứng chỉ",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA2t4Tj7TQZ9naQS_AzkYWqmqAlh1ThVc5hbM7q3j3x_i8i59OEMdlfmBҳ",
  },
];

const PharmacistsGrid = () => {
  const navigate = useNavigate();

  const handleNavigateBooking = (pharmacist) => {
    navigate("/booking", { state: { pharmacist } });
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {pharmacists.map((pharmacist) => (
        <article
          key={pharmacist.id}
          className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300"
        >
          <div className="p-5 flex flex-col items-center text-center gap-3">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full bg-cover bg-center border-4 border-white shadow-sm"
                style={{ backgroundImage: `url('${pharmacist.image}')` }}
              />
              <div
                className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-[3px] border-white ${
                  pharmacist.status === "online"
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              />
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-white text-lg font-bold group-hover:text-primary transition-colors">
                {pharmacist.name}
              </h3>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {pharmacist.tag}
                </span>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pharmacist.experience}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <div className="flex items-center text-yellow-400">
                <span className="material-symbols-outlined text-[18px]">
                  star
                </span>
                <span className="text-slate-900 dark:text-white font-bold ml-1 text-base">
                  {pharmacist.rating.toFixed(1)}
                </span>
              </div>
              <span>({pharmacist.reviews} đánh giá)</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
              <span className="material-symbols-outlined text-[14px]">
                verified
              </span>
              {pharmacist.badge}
            </div>
          </div>
          <div className="p-4 pt-0 mt-auto grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleNavigateBooking(pharmacist)}
              className="col-span-1 py-2 px-3 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Xem hồ sơ
            </button>
            <button
              type="button"
              onClick={() => handleNavigateBooking(pharmacist)}
              className="col-span-1 py-2 px-3 rounded-lg bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-dark transition-colors"
            >
              Chọn tư vấn
            </button>
          </div>
        </article>
      ))}
    </section>
  );
};

export default PharmacistsGrid;

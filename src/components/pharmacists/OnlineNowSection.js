import React from "react";
import { useNavigate } from "react-router-dom";

const onlinePharmacists = [
  {
    id: 1,
    name: "DS. Lan Anh",
    specialty: "Dược lâm sàng",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDAoLQ60_gioxtcXsW1-laq0SjjUtohpd5fLfYPrJbLG5gcY2hqQiuV1jxS6xF-hPWYe_lcLbsPyBirhMsPnCx5VVJ9Nke9FfEb60VI9NLXe9XXG034AY5Wa1JARd1UPQTy3jqrL2jpQd1YsjYEdX_t8bCfVK6tRnIUg-6V62lReqJoTZlelrj7VcVfxxVx0hol22dh4xT8qZeFYBwAweN8ViqHeIplNZPtHviAd7QuzAmYXPyWGbEXJkE8m-JJPgpubSlEGYcTy30g",
  },
  {
    id: 2,
    name: "DS. Minh Tuấn",
    specialty: "Tư vấn thuốc",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAnMKXt5owBYK7N_4myb9fd6p0yJRsp6SjZ48EYFZcHM5XiOdyHjTjmankTYehQP9wX6qj-TiNhJYII25TiitxJS_iYLCxrtyq2uPiRlQlU_bZhgwEuczmYWQZ-hg3tcSmhwLgw05M6Cc1vckBny3Ru46JYmi-pebMl1xf6A90jIF6ers1AIHfAqAuEE3nnsshKdsZOE_zmo8uH3lamTyJ1ep7H6IRNtcRRrKXBnKKwKFBBlMZZMWc2jaLp-XHBnf5s54_bO6WGspLS",
  },
  {
    id: 3,
    name: "DS. Hồng Ngọc",
    specialty: "Dược nhi",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvr642YyeLIf5T7ua5B6497vQCaJG4w4aRMyvxJfS18n1Xi154s5EpJuCz98ERGCevOa6EOz3dCEw24UqFzY5FPA5tZdxOrxZuaabPTMZqcscIRyIZL7z5fxcTgboho7NdTsYT6fF4awzLb7oZ38pj1AdMS9v-AtuGzhYbLo14ERT8G3LTnMtb2Ni-otiiSZLdmSJBhVeHjnCm6Hc3oSW9UZOxuCJFNkbb1JVDsLmVrYqdI0SyKUn7xhySJoQ7x6b5vjOGvEoTOhNc",
  },
  {
    id: 4,
    name: "DS. Quốc Bảo",
    specialty: "Dinh dưỡng",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC2r_lzJ7iNLZccJLiVXrZW3kpzprP6wMc7hjpSiA9ojhD9wzEwBcxkXvudXY4-y1j7HwW6UjZYtn9tYhIDB6o1L_wu1UW-EvPktcMDVCB0O4rrY2fBLp8xNX_V41ZE3UtyPR5zDGUXjb3YTyEuSK3UcUQmun4293x0JSpoA9FlieEE_e-U874WlVPfjDCO02FnMXeL1mGULuxTMmOSzp-S7PSQ6pP9QZlby5dRxj_STY6TtEdgOtNbWkjk8TZaBxUz3o-Hy1PCemNN",
  },
];

const OnlineNowSection = () => {
  const navigate = useNavigate();

  const handleNavigateBooking = (pharmacist) => {
    navigate("/booking", { state: { pharmacist } });
  };

  return (
    <section className="rounded-xl bg-blue-50/50 border border-blue-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
          <h3 className="text-slate-900 text-lg font-bold">
            Dược sĩ đang Online ngay
          </h3>
        </div>
        <button className="text-sm font-semibold text-primary hover:underline">
          Xem tất cả
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {onlinePharmacists.map((pharmacist) => (
          <article
            key={pharmacist.id}
            className="flex flex-col items-center bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="relative mb-2">
              <div
                className="w-16 h-16 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url('${pharmacist.image}')` }}
              />
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {pharmacist.name}
            </p>
            <p className="text-xs text-slate-500">{pharmacist.specialty}</p>
            <button
              type="button"
              onClick={() => handleNavigateBooking(pharmacist)}
              className="mt-2 w-full text-xs font-bold text-primary bg-blue-50 py-1.5 rounded hover:bg-blue-100 transition-colors"
            >
              Tư vấn ngay
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default OnlineNowSection;

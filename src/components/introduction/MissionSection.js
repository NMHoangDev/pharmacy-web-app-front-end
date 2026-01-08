import React from "react";

const MissionSection = () => {
  return (
    <section className="flex flex-col gap-10 px-4 py-10 @container">
      <div className="flex flex-col gap-4">
        <h2 className="text-[#0d141b] dark:text-white tracking-light text-[32px] font-bold leading-tight max-w-[720px]">
          Câu chuyện của chúng tôi
        </h2>
        <p className="text-[#4c739a] dark:text-slate-300 text-lg font-normal leading-relaxed max-w-[800px]">
          Được thành lập vào năm 2015, Nhà thuốc Online ra đời với mong muốn rút
          ngắn khoảng cách giữa bệnh nhân và thuốc tốt. Chúng tôi hiểu rằng việc
          tiếp cận y tế chất lượng cao không phải lúc nào cũng dễ dàng. Vì vậy,
          chúng tôi cam kết mang đến những sản phẩm chính hãng, tư vấn tận tình
          và dịch vụ giao hàng nhanh chóng nhất.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-1 gap-4 rounded-xl border border-[#cfdbe7] dark:border-slate-700 bg-white dark:bg-slate-900 p-6 flex-col shadow-sm hover:shadow-md transition-shadow">
          <div className="text-primary bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined">favorite</span>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-[#0d141b] dark:text-white text-xl font-bold leading-tight">
              Sứ mệnh
            </h3>
            <p className="text-[#4c739a] dark:text-slate-300 text-sm font-normal leading-relaxed">
              Chăm sóc sức khỏe toàn diện cho mọi gia đình Việt bằng sự tận tâm
              và chuyên môn cao nhất.
            </p>
          </div>
        </div>

        <div className="flex flex-1 gap-4 rounded-xl border border-[#cfdbe7] dark:border-slate-700 bg-white dark:bg-slate-900 p-6 flex-col shadow-sm hover:shadow-md transition-shadow">
          <div className="text-primary bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined">visibility</span>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-[#0d141b] dark:text-white text-xl font-bold leading-tight">
              Tầm nhìn
            </h3>
            <p className="text-[#4c739a] dark:text-slate-300 text-sm font-normal leading-relaxed">
              Trở thành hệ thống nhà thuốc trực tuyến đáng tin cậy nhất và tiện
              lợi nhất tại Việt Nam.
            </p>
          </div>
        </div>

        <div className="flex flex-1 gap-4 rounded-xl border border-[#cfdbe7] dark:border-slate-700 bg-white dark:bg-slate-900 p-6 flex-col shadow-sm hover:shadow-md transition-shadow">
          <div className="text-primary bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined">verified_user</span>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-[#0d141b] dark:text-white text-xl font-bold leading-tight">
              Giá trị cốt lõi
            </h3>
            <p className="text-[#4c739a] dark:text-slate-300 text-sm font-normal leading-relaxed">
              Trung thực trong tư vấn, Chất lượng trong sản phẩm, và Trách nhiệm
              với cộng đồng.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;

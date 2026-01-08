import React from "react";

const CallToActionSection = () => {
  return (
    <section className="px-4 py-12">
      <div className="bg-gradient-to-r from-[#101922] to-[#2c3e50] rounded-2xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col gap-3 max-w-xl">
          <h2 className="text-white text-2xl md:text-3xl font-bold">
            Bạn cần tư vấn sức khỏe?
          </h2>
          <p className="text-blue-100 text-base md:text-lg">
            Đội ngũ dược sĩ của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-blue-500/30">
            Chat ngay
          </button>
          <button className="bg-white text-[#101922] font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
            Gọi hotline
          </button>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;

import React from "react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthHero from "../../components/auth/AuthHero";
import SignupForm from "../../components/auth/SignupForm";

const SignupPage = () => {
  const hero = (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-blue-800/90 z-10" />
        <img
          alt="Nền y tế"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJBTiXlKjIf6C_cY2tYOk2_Fm2KTgN83DhzOp3yJaGRGf5c8aUIsm4QyV8WeHxjWW5gsfxaDZwMvDiF2JS1u2YK-ZZdM2X0Rioy-u69LHVuOueFcbyP-BrqswB51XhJCjAmK8hasVISqyQ1_FiWk5KXmR-C6gXiTdQ8OpZ70IQqmGXUNL0uFhUCnWzzQS6VjyPRhltAqJwDMtbdJnBavMOOIdDm5b8nq9JhGtUJFE5mJrrwFlywddaqfHdEhWGtqkE2Vz7YV34ipsR"
        />
      </div>

      <div className="relative z-20 max-w-lg px-10 flex flex-col items-center text-center">
        <div className="mb-10 relative">
          <div className="absolute -inset-4 bg-white/20 rounded-full blur-xl animate-pulse" />
          <img
            alt="Dược sĩ"
            className="relative size-48 xl:size-64 object-cover rounded-full border-4 border-white/30 shadow-2xl"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOcrWLuiRwJCdDac42Y7IguhEGRZVxoR1VTpUabE5Wa5_ZDPmrSgMQpPl6IcOaNKXtUECt-4gmid5I0lPEcAT0GO_HU3SBcbYfnhidPPcufUVN9EDMYaUKgzd66MoqHXfWcsFTRCXA8k9NXp4tfKDON3EcrZPAmw-OF7emthJxLsr90fEzvfW0nKOhUv-1MVC_ECCjEW0ZJTSGZlLwnqH8A6mmxLxDrcE3HnCrkDpUjsfVGDznyPHKtUDE8-QEluCp5DiwQSWHqUhj"
          />
          <div
            className="absolute bottom-0 right-0 bg-white text-primary px-4 py-2 rounded-full shadow-lg font-bold flex items-center gap-2 animate-bounce"
            style={{ animationDuration: "3s" }}
          >
            <span className="material-symbols-outlined text-yellow-500">
              star
            </span>
            Top Rated
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
          Chăm sóc sức khỏe
          <br />
          toàn diện cho gia đình bạn
        </h2>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full text-left border border-white/20 shadow-xl">
          <ul className="space-y-4">
            {[
              {
                icon: "medical_services",
                title: "Tư vấn cùng dược sĩ",
                body: "Đội ngũ chuyên môn sẵn sàng hỗ trợ 24/7.",
              },
              {
                icon: "inventory_2",
                title: "Theo dõi đơn hàng",
                body: "Cập nhật trạng thái vận chuyển và lịch sử mua.",
              },
              {
                icon: "card_giftcard",
                title: "Ưu đãi thành viên",
                body: "Tích điểm đổi quà và nhận voucher độc quyền.",
              },
            ].map((item) => (
              <li key={item.title} className="flex items-start gap-4">
                <div className="bg-white/20 p-2 rounded-lg text-white shrink-0">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">{item.title}</h4>
                  <p className="text-blue-100 text-sm">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="absolute top-10 right-10 size-24 bg-white/5 rounded-full blur-2xl" />
      <div className="absolute bottom-10 left-10 size-32 bg-blue-400/20 rounded-full blur-3xl" />
    </div>
  );

  return (
    <AuthLayout hero={hero} brand="Pharmacy App">
      <div className="mb-2">
        <h1 className="text-3xl lg:text-[32px] font-bold leading-tight mb-2 text-slate-900 dark:text-white">
          Tạo tài khoản
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base">
          Nhập thông tin để bắt đầu hành trình chăm sóc sức khỏe.
        </p>
      </div>
      <SignupForm />
    </AuthLayout>
  );
};

export default SignupPage;

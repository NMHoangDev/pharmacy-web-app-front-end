import React from "react";

const Card = ({ icon, title, value, badge, accent }) => (
  <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-[#111a22] border border-[#cfdbe7] dark:border-gray-800 shadow-sm">
    <div className="flex items-center gap-2 mb-2">
      <span className={`p-2 rounded-lg ${accent}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </span>
      <p className="text-[#4c739a] text-sm font-medium">{title}</p>
    </div>
    <div className="flex items-baseline gap-2">
      <p className="text-[#0d141b] dark:text-white text-2xl font-bold">
        {value}
      </p>
      {badge && (
        <p className={`text-sm font-medium px-2 py-0.5 rounded-full ${badge}`}>
          {badge.label}
        </p>
      )}
    </div>
  </div>
);

const ReviewsStats = ({ total, average, pending }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card
      icon="reviews"
      title="Tổng đánh giá"
      value={total}
      accent="bg-blue-50 dark:bg-blue-900/20 text-primary"
      badge={{ label: "+5% tuần này", className: "text-green-600 bg-green-50" }}
    />
    <Card
      icon="star"
      title="Đánh giá trung bình"
      value={`${average.toFixed(1)}/5.0`}
      accent="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600"
      badge={{ label: "+0.2%", className: "text-green-600 bg-green-50" }}
    />
    <Card
      icon="pending_actions"
      title="Chờ phản hồi"
      value={pending}
      accent="bg-orange-50 dark:bg-orange-900/20 text-orange-600"
      badge={null}
    />
  </div>
);

export default ReviewsStats;

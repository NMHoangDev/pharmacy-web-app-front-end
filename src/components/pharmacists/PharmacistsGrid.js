import React from "react";
import { useNavigate } from "react-router-dom";
import PharmacistCard from "./PharmacistCard";
import PharmacistSkeleton from "./PharmacistSkeleton";

const PharmacistsGrid = ({ pharmacists = [], loading }) => {
  const navigate = useNavigate();

  const handleNavigateBooking = (pharmacist) => {
    navigate("/booking", { state: { pharmacist } });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PharmacistSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {pharmacists.map((pharmacist) => (
        <PharmacistCard
          key={pharmacist.id}
          pharmacist={pharmacist}
          onNavigate={handleNavigateBooking}
        />
      ))}
    </div>
  );
};

export default PharmacistsGrid;

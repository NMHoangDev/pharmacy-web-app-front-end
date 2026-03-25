import React from "react";
import MedicineCard from "./MedicineCard";
import MedicineSkeleton from "./MedicineSkeleton";
import CardGridMotion from "../ui/motion/CardGridMotion";

const MedicinesGrid = ({ products, onAddToCart, onConsult, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, idx) => (
          <MedicineSkeleton key={idx} />
        ))}
      </div>
    );
  }

  return (
    <CardGridMotion className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <MedicineCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onConsult={onConsult}
        />
      ))}
    </CardGridMotion>
  );
};

export default MedicinesGrid;

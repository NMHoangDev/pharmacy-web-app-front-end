import React, { useEffect } from "react";
import MedicineCard from "./MedicineCard";

const GRID_CLASS =
  "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3";

const MedicinesGrid = ({ products = [], onAddToCart, onConsult }) => {
  useEffect(() => {
    console.log(products);
  }, []);
  return (
    <div className={GRID_CLASS}>
      {products.map((product) => (
        <MedicineCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onConsult={onConsult}
        />
      ))}
    </div>
  );
};

export default MedicinesGrid;

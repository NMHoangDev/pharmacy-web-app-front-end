import React, { useMemo, useState } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import MedicinesBreadcrumbs from "../../../components/medicines/MedicinesBreadcrumbs";
import MedicinesFilters from "../../../components/medicines/MedicinesFilters";
import MedicinesHeaderBar from "../../../components/medicines/MedicinesHeaderBar";
import MedicinesGrid from "../../../components/medicines/MedicinesGrid";
import MedicinesPagination from "../../../components/medicines/MedicinesPagination";
import medicinesProducts, { parsePrice } from "../../../data/medicinesProducts";

const allPrices = medicinesProducts.map((p) => parsePrice(p.price));
const overallMinPrice = Math.min(...allPrices);
const overallMaxPrice = Math.max(...allPrices);

const MedicinesPage = () => {
  const [priceRange, setPriceRange] = useState({
    min: overallMinPrice,
    max: overallMaxPrice,
  });

  const handlePriceRangeChange = (nextRange) => {
    let { min, max } = nextRange;
    if (min > max) {
      [min, max] = [max, min];
    }
    min = Math.max(overallMinPrice, min);
    max = Math.min(overallMaxPrice, max);
    setPriceRange({ min, max });
  };

  const filteredProducts = useMemo(
    () =>
      medicinesProducts.filter((product) => {
        const price = parsePrice(product.price);
        return price >= priceRange.min && price <= priceRange.max;
      }),
    [priceRange]
  );

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-display flex flex-col text-slate-900 dark:text-white antialiased">
      <Header />
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-6 flex-grow w-full">
        <MedicinesBreadcrumbs />
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <MedicinesFilters
            priceRange={priceRange}
            minPrice={overallMinPrice}
            maxPrice={overallMaxPrice}
            onChangePriceRange={handlePriceRangeChange}
          />
          <main className="flex-1 w-full">
            <MedicinesHeaderBar
              total={medicinesProducts.length}
              showing={filteredProducts.length}
            />
            <MedicinesGrid products={filteredProducts} />
            <MedicinesPagination />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MedicinesPage;

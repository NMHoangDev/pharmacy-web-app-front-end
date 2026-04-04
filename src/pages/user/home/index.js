import React, { Suspense } from "react";
import Header from "../../../components/Header";
import HeroSection from "../../../components/home/HeroSection";
import CategorySection from "../../../components/home/CategorySection";
import ProductSection from "../../../components/home/ProductSection";
import Footer from "../../../components/Footer";
import PageTransition from "../../../components/ui/PageTransition";
import "../../../styles/storefront-premium.css";

const TrustSection = React.lazy(
  () => import("../../../components/home/TrustSection"),
);

const HomePage = () => {
  return (
    <PageTransition className="storefront-shell min-h-screen text-slate-900">
      <Header />
      <main className="flex-1 pb-10">
        <HeroSection />
        <CategorySection />
        <ProductSection />
        <Suspense
          fallback={
            <section className="py-6 sm:py-8">
              <div className="storefront-container mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
                <div className="storefront-card rounded-[32px] p-6">
                  <div className="h-5 w-44 animate-pulse rounded bg-slate-100" />
                  <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-slate-100" />
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="h-36 animate-pulse rounded-[28px] bg-slate-100"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          }
        >
          <TrustSection />
        </Suspense>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default HomePage;

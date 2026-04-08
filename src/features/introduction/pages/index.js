import React from "react";
import Header from "../../../shared/components/layout/Header";
import Footer from "../../../shared/components/layout/Footer";
import Breadcrumbs from "../../../shared/components/layout/Breadcrumbs";
import IntroductionHeroSection from "../components/HeroSection";
import MissionSection from "../components/MissionSection";
import CommitmentSection from "../components/CommitmentSection";
import TeamSection from "../components/TeamSection";
import CallToActionSection from "../components/CallToActionSection";
import PageTransition from "../../../shared/components/ui/PageTransition";
import "../../../app/styles/storefront-premium.css";

const IntroductionPage = () => {
  return (
    <PageTransition className="storefront-shell min-h-screen text-slate-900">
      <Header />
      <main className="storefront-container mx-auto flex w-full max-w-[1120px] flex-1 flex-col px-0 pb-10 pt-5">
        <div className="px-4 lg:px-0">
          <Breadcrumbs items={[{ label: "Về chúng tôi" }]} />
        </div>
        <IntroductionHeroSection />
        <MissionSection />
        <CommitmentSection />
        <TeamSection />
        <CallToActionSection />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default IntroductionPage;

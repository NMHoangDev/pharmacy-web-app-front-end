import React from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Breadcrumbs from "../../../components/Breadcrumbs";
import IntroductionHeroSection from "../../../components/introduction/HeroSection";
import MissionSection from "../../../components/introduction/MissionSection";
import CommitmentSection from "../../../components/introduction/CommitmentSection";
import TeamSection from "../../../components/introduction/TeamSection";
import CallToActionSection from "../../../components/introduction/CallToActionSection";
import PageTransition from "../../../components/ui/PageTransition";
import "../../../styles/storefront-premium.css";

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

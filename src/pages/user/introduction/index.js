import React from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Breadcrumbs from "../../../components/Breadcrumbs";
import IntroductionHeroSection from "../../../components/introduction/HeroSection";
import MissionSection from "../../../components/introduction/MissionSection";
import CommitmentSection from "../../../components/introduction/CommitmentSection";
import TeamSection from "../../../components/introduction/TeamSection";
import CallToActionSection from "../../../components/introduction/CallToActionSection";

const IntroductionPage = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-display flex flex-col text-[#101922] dark:text-white antialiased">
      <Header />
      <div className="flex flex-1 justify-center py-5">
        <div className="flex flex-col max-w-[960px] flex-1 px-0 lg:px-0">
          <div className="px-4 lg:px-0 mb-2">
            <Breadcrumbs items={[{ label: "Về chúng tôi" }]} />
          </div>
          <IntroductionHeroSection />
          <MissionSection />
          <CommitmentSection />
          <TeamSection />
          <CallToActionSection />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default IntroductionPage;

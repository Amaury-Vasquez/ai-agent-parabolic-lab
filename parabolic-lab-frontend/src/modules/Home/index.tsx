"use client";
import CTASection from "./CTASection";
import FeaturesSection from "./FeaturesSection";
import HeroSection from "./HeroSection";
import TeacherBenefitsSection from "./TeacherBenefitsSection";

const Home = () => (
  <div className="min-h-dvh">
    <HeroSection />
    <FeaturesSection />
    <TeacherBenefitsSection />
    <CTASection />
  </div>
);

export default Home;

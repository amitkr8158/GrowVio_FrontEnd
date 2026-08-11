import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import KnowledgePyramid from "@/components/landing/KnowledgePyramid";
import PricingSection from "@/components/landing/PricingSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import PlansPage from "@/pages/PlansPage"

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <KnowledgePyramid />
      {/* <PricingSection /> */}
      <CTASection />
      <PlansPage />

      <Footer />
    </div>
  );
};

export default Index;

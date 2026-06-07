import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import FlashSaleSection from "@/components/sections/FlashSaleSection";
import TopDealsSection from "@/components/sections/TopDealsSection";
import SellerCTASection from "@/components/sections/SellerCTASection";
import TrustSection from "@/components/sections/TrustSection";
import VoucherBannerSection from "@/components/sections/VoucherBannerSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <VoucherBannerSection />
        <CategoriesSection />
        <FeaturedProducts />
        <FlashSaleSection />
        <TopDealsSection />
        <SellerCTASection />
        <TrustSection />
      </main>
      <Footer />
    </>
  );
}

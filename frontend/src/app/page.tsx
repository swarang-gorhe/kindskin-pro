import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { HeroSection } from "@/components/home/HeroSection";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { VisualGallery } from "@/components/home/VisualGallery";
import { SkincareTipsSection } from "@/components/home/SkincareTipsSection";
import { HomeSidebar } from "@/components/home/HomeSidebar";
import { CustomerPromise } from "@/components/home/CustomerPromise";

export default function HomePage() {
  return (
    <>
      <LoadingScreen />
      <HeroSection />

      <div className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-10 xl:gap-14">
          <div className="min-w-0">
            <ProductShowcase />
            <FeaturedSection />
            <VisualGallery />
            <SkincareTipsSection />
            <CustomerPromise />
          </div>
          <div>
            <div className="lg:sticky lg:top-24">
              <HomeSidebar />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

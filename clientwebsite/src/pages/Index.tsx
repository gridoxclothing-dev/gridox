import { lazy, Suspense, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import AnnouncementBar from "@/components/AnnouncementBar";

const NewIn = lazy(() => import("@/components/NewIn"));
const CategoryGrid = lazy(() => import("@/components/CategoryGrid"));
const BestSellers = lazy(() => import("@/components/BestSellers"));
const CuratedLooks = lazy(() => import("@/components/CuratedLooks"));
const BulkOrderBanner = lazy(() => import("@/components/BulkOrderBanner"));
const Reels = lazy(() => import("@/components/Reels"));
const InstagramFeed = lazy(() => import("@/components/InstagramFeed"));
const CustomerReviews = lazy(() => import("@/components/CustomerReviews"));
const AboutUs = lazy(() => import("@/components/AboutUs"));
const BottomNav = lazy(() => import("@/components/BottomNav"));
const WhatsAppButton = lazy(() => import("@/components/WhatsAppButton"));

const SectionSkeleton = () => <div className="h-[400px] w-full bg-muted/10 animate-pulse rounded-lg my-10" />;

const Index = () => {
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Helmet>
        <title>GriDox | Premium Women's Fashion in Coimbatore & Tirupur</title>
        <meta name="description" content="GriDox is the best online store for women's fashion in Coimbatore and Tirupur. Shop designer Peplum Co-ords, Cotton Kurti Sets, and Raw Silk ensembles. Experience express delivery and high-quality ethnic wear tailored for the modern Tamil Nadu woman." />
        <meta property="og:title" content="GriDox | Best Women's Clothing Store in Coimbatore & Tirupur" />
        <meta property="og:description" content="Discover uniquely designed, high-quality women's outfits at GriDox. Premium fabrics, perfect fits, and sophisticated styles with fast shipping in Coimbatore, Tirupur, and Erode." />
        <meta property="og:url" content="https://gridox.in" />
        <meta name="keywords" content="women fashion Coimbatore, designer clothing Tirupur, premium ethnic wear Coimbatore, peplum co-ords Tirupur, cotton kurti sets Coimbatore, fashion store Tamil Nadu, GriDox Coimbatore" />
        <link rel="canonical" href="https://gridox.in" />
      </Helmet>

      <AnnouncementBar />
      <Header />

      <div className="animate-in fade-in duration-700 ease-out fill-mode-both">
        <HeroCarousel />
      </div>

      <Suspense fallback={<SectionSkeleton />}>
        <div id="new-arrivals"><NewIn /></div>
        <CategoryGrid />
        <CuratedLooks />
        <BestSellers />
        <BulkOrderBanner />
        <Reels />
        <InstagramFeed />
        <CustomerReviews />
        <div id="about"><AboutUs /></div>
        <BottomNav />
        <WhatsAppButton />
      </Suspense>
    </div>
  );
};

export default Index;

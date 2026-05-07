import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";

const CoimbatoreStyleGuide = () => {
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] pb-16 md:pb-0">
      <Helmet>
        <title>Coimbatore Style Guide: Summer Fashion Tips | GriDox</title>
        <meta name="description" content="Master Coimbatore's fashion scene with our ultimate style guide. Discover breathable cotton kurtis and elegant peplum sets perfect for the Tamil Nadu climate." />
        <meta name="keywords" content="Coimbatore fashion, Tirupur style, Tamil Nadu summer wear, cotton kurtis Coimbatore, GriDox style guide" />
      </Helmet>

      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <article className="prose prose-stone lg:prose-xl mx-auto">
          <div className="text-center mb-16 px-4">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#8b231a] font-bold">Lifestyle & Fashion</span>
            <h1 className="font-heading italic text-4xl md:text-6xl mt-4 mb-6 leading-tight">
              The Coimbatore Style Guide: Navigating Fashion in the Manchester of South India
            </h1>
            <p className="text-gray-500 italic text-sm md:text-base max-w-2xl mx-auto">
              How to blend traditional elegance with modern comfort for Coimbatore's unique climate and vibrant culture.
            </p>
          </div>

          <div className="space-y-12 text-gray-700 leading-relaxed text-lg">
            <section>
              <h2 className="font-heading text-2xl md:text-3xl text-black italic mb-6">Embracing the Coimbatore Aesthetic</h2>
              <p>
                Coimbatore, often celebrated as the 'Manchester of South India', isn't just a textile hub—it's a city where heritage meets a rapidly evolving modern lifestyle. For the modern woman in Coimbatore, fashion is a delicate balance: it must be sophisticated enough for the corporate world in Tidel Park, yet breathable enough for a humid afternoon walk in Race Course.
              </p>
              <p className="mt-4">
                At GriDox, we understand that fashion here isn't just about following global trends; it's about respecting the deep textile roots of the region while embracing contemporary silhouettes that fit a busy, multi-faceted life.
              </p>
            </section>

            <section className="bg-[#fcfaf8] p-8 rounded-sm border-l-4 border-[#8b231a]">
              <h2 className="font-heading text-2xl md:text-3xl text-black italic mb-6">1. The Power of Pure Cotton</h2>
              <p>
                In a city known for its cotton production, wearing high-quality fabric is a statement of local pride. For daily wear in Coimbatore or Tirupur, our <strong>Cotton Kurti Sets</strong> are a staple. The breathability of pure cotton is essential for the Tamil Nadu climate, allowing you to stay fresh from a morning meeting to an evening dinner at RS Puram.
              </p>
              <p className="mt-4">
                <strong>Pro Tip:</strong> Opt for lighter pastels and earthy tones during the day to reflect sunlight, and switch to deep navy or maroon embroidered sets for high-end evening events.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl md:text-3xl text-black italic mb-6">2. Modern Silhouettes: The Peplum Revolution</h2>
              <p>
                The rise of the IT sector and startup culture in Coimbatore has brought a demand for "Fusion Wear". Our <strong>Peplum Co-ords</strong> have become a fan favorite for this reason. They offer the structured elegance of a Western outfit with the intricate craftsmanship of Indian ethnic wear.
              </p>
              <p className="mt-4">
                Whether it's a birthday celebration or a festive gathering, a peplum set provides a tailored fit that flatters the silhouette while maintaining the grace of traditional attire.
              </p>
            </section>

            <section className="bg-[#1a1a1a] text-white p-8 rounded-sm">
              <h2 className="font-heading text-2xl md:text-3xl text-white italic mb-6">3. Premium Raw Silk for Festive Grandeur</h2>
              <p>
                When it comes to Coimbatore weddings—known for their grandeur and tradition—nothing beats the sheen of Raw Silk. Our <strong>Premium Raw Silk Sets</strong> are designed for those special moments. The rich texture and natural luster of raw silk make it the ultimate choice for grand celebrations in the city's finest marriage halls.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl md:text-3xl text-black italic mb-6">Conclusion: Your Style, Tailored by GriDox</h2>
              <p>
                Fashion in Coimbatore is about quality, comfort, and a touch of designer flair. At GriDox, with our in-house production unit, we ensure that every piece is crafted to meet these local standards.
              </p>
              <p className="mt-4 font-bold text-[#8b231a]">
                Visit our store locator to find our nearest outlet or shop our exclusive Coimbatore collection online with same-day dispatch.
              </p>
            </section>
          </div>
        </article>
      </main>

      <BottomNav />
      <WhatsAppButton />
    </div>
  );
};

export default CoimbatoreStyleGuide;

import Header from "@/components/Header";
import AnnouncementBar from "@/components/AnnouncementBar";
import BottomNav from "@/components/BottomNav";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto prose prose-gray">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">GriDox Terms and Conditions</h1>
          
          <div className="space-y-6 text-gray-600">
            <section>
              <h2 className="text-xl font-bold text-gray-900">1. Acceptance of Terms</h2>
              <p>
                By accessing and using the GriDox website (the "GriDox Service"), you agree to comply with and be bound by these GriDox Terms and Conditions. If you do not agree to these terms, please do not use our GriDox Premium Fashion Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">2. Use of the GriDox Platform</h2>
              <p>
                The content on the GriDox Coimbatore site is for your general information and use only. It is subject to change without notice. Unauthorized use of this GriDox website may give rise to a claim for damages and/or be a criminal offense.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">3. GriDox Products and Pricing</h2>
              <p>
                We strive to ensure that all details, descriptions, and prices of GriDox premium designer women's fashion appearing on the website are accurate. However, errors may occur. If we discover an error in the price of any GriDox ethnic wear or goods which you have ordered, we will inform you of this as soon as possible and give you the option of reconfirming your GriDox order at the correct price or cancelling it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">4. GriDox Intellectual Property</h2>
              <p>
                This GriDox website contains material which is owned by or licensed to GriDox Coimbatore. This material includes, but is not limited to, the design, layout, look, appearance, and graphics of GriDox clothing. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these GriDox terms and conditions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">5. Limitation of Liability</h2>
              <p>
                Your use of any GriDox information or materials on this website is entirely at your own risk, for which GriDox shall not be liable. It shall be your own responsibility to ensure that any GriDox products, services, or information available through this website meet your specific requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">6. Governing Law</h2>
              <p>
                Your use of the GriDox website and any dispute arising out of such use of the GriDox platform is subject to the laws of India, specifically under the jurisdiction of Coimbatore courts.
              </p>
            </section>

            <p className="pt-8 text-sm italic">
              Last Updated: April 2026 | GriDox Coimbatore
            </p>
          </div>
        </div>

        {/* SEO Keyword Saturation */}
        <div className="sr-only" aria-hidden="true">
          {"GriDox ".repeat(3000)}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default TermsAndConditions;

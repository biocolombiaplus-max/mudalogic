"use client";

import { useRouter } from "next/navigation";
import type { SiteContent } from "@/lib/settings";
import Header from "./Header";
import Hero from "./Hero";
import TrustBadges from "./TrustBadges";
import Services from "./Services";
import HowItWorks from "./HowItWorks";
import Location from "./Location";
import Gallery from "./Gallery";
import Testimonials from "./Testimonials";
import FAQ from "./FAQ";
import TrackingTeaser from "./TrackingTeaser";
import CTASection from "./CTASection";
import Footer from "./Footer";
import WhatsAppFloat from "./WhatsAppFloat";
import MetaPixel from "@/components/analytics/MetaPixel";

export default function LandingClient({ content }: { content: SiteContent }) {
  const router = useRouter();
  const openQuote = () => router.push("/cotizacion");
  const whatsappHref = `https://wa.me/${content.whatsapp}?text=${encodeURIComponent(
    "Hola MudaLogic, quiero información sobre mudanzas."
  )}`;

  return (
    <>
      <MetaPixel pixelId={content.metaPixelId} />
      <Header logo={content.logo} phoneDisplay={content.phone_display} onOpenQuote={openQuote} />
      <main>
        <Hero
          title={content.heroTitle}
          subtitle={content.heroSubtitle}
          image={content.heroImage}
          whatsappHref={whatsappHref}
          stats={content.stats}
          onOpenQuote={openQuote}
        />
        <TrustBadges badges={content.trustBadges} />
        <Services services={content.services} />
        <HowItWorks />
        <Location
          addressCucuta={content.address_cucuta}
          addressMedellin={content.address_medellin}
          cucutaImage={content.locationCucutaImage}
          medellinImage={content.locationMedellinImage}
          phoneDisplay={content.phone_display}
        />
        <Gallery images={content.gallery} />
        <Testimonials testimonials={content.testimonials} />
        <FAQ items={content.faq} />
        <TrackingTeaser />
        <CTASection whatsappHref={whatsappHref} onOpenQuote={openQuote} />
      </main>
      <Footer
        logo={content.logo}
        phoneDisplay={content.phone_display}
        email={content.email}
        addressCucuta={content.address_cucuta}
        addressMedellin={content.address_medellin}
        whatsappHref={whatsappHref}
      />
      <WhatsAppFloat href={whatsappHref} />
    </>
  );
}

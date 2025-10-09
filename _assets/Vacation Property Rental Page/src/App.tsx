import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Amenities } from "./components/Amenities";
import { Gallery } from "./components/Gallery";
import { Pricing } from "./components/Pricing";
import { NearbyAttractions } from "./components/NearbyAttractions";
import { Testimonials } from "./components/Testimonials";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <About />
      <Amenities />
      <Gallery />
      <Pricing />
      <NearbyAttractions />
      <Testimonials />
      <Contact />
      <Footer />
      <Toaster />
    </div>
  );
}

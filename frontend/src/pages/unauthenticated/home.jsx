import React from "react";
import Hero from "../../components/hero";
import Contact from "../../components/contact";
import { Element } from "react-scroll";
import WhyChooseUs from "../../components/whychooseus";
import Pricing from "../../components/pricing";
import HeroCards from "../../components/herocards";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Features Section */}
      <Element name="features" className="pt-16">
        <div className="w-screen flex min-h-[500px] md:h-[30vw] justify-center py-6 md:py-10">
          <Hero />
        </div>
        <HeroCards />
      </Element>

      {/* Pricing Section */}
      <Element name="pricing" className="pt-16">
        <Pricing />
      </Element>

      {/* Why Choose Us Section */}
      <Element
        name="why-choose-us"
        className="pt-16 h-screen flex items-center justify-center"
      >
        <WhyChooseUs />
      </Element>

      {/* Contact Section with proper ID for scrolling */}
      <Element name="contact" className="pt-16">
        <Contact />
      </Element>
    </div>
  );
};

export default Home;

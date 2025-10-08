import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    property: [
      { label: "About Villa", href: "#about" },
      { label: "Amenities", href: "#amenities" },
      { label: "Gallery", href: "#gallery" },
      { label: "Pricing", href: "#pricing" },
    ],
    explore: [
      { label: "Nearby Attractions", href: "#nearby" },
      { label: "Guest Reviews", href: "#testimonials" },
      { label: "Book Now", href: "#contact" },
      { label: "FAQs", href: "#contact" },
    ],
    legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cancellation Policy", href: "#pricing" },
      { label: "House Rules", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl mb-4">Villa Serenity</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Experience the ultimate Mediterranean getaway in our luxury villa.
              Breathtaking views, modern amenities, and unforgettable memories
              await.
            </p>
            <div className="space-y-3">
              <a
                href="tel:+15551234567"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
              >
                <Phone className="h-5 w-5" />
                <span>+1 (555) 123-4567</span>
              </a>
              <a
                href="mailto:info@villaserenity.com"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span>info@villaserenity.com</span>
              </a>
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin className="h-5 w-5 mt-0.5" />
                <span>123 Coastal Drive, Mediterranean Coast</span>
              </div>
            </div>
          </div>

          {/* Property Links */}
          <div>
            <h4 className="mb-4">Property</h4>
            <ul className="space-y-2">
              {footerLinks.property.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href.replace("#", ""))}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore Links */}
          <div>
            <h4 className="mb-4">Explore</h4>
            <ul className="space-y-2">
              {footerLinks.explore.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href.replace("#", ""))}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-4 mb-8 pt-8 border-t border-gray-800">
          {socialLinks.map((social, index) => {
            const Icon = social.icon;
            return (
              <a
                key={index}
                href={social.href}
                aria-label={social.label}
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Icon className="h-5 w-5" />
              </a>
            );
          })}
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-400 text-sm">
          <p>
            © {currentYear} Villa Serenity. All rights reserved. Luxury vacation
            rental in the Mediterranean.
          </p>
        </div>
      </div>
    </footer>
  );
}

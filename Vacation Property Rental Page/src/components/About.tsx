import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Home, Users, Bed, Bath } from "lucide-react";

export function About() {
  const stats = [
    { icon: Home, label: "Living Space", value: "3,500 sq ft" },
    { icon: Users, label: "Guests", value: "8-10" },
    { icon: Bed, label: "Bedrooms", value: "4" },
    { icon: Bath, label: "Bathrooms", value: "3.5" },
  ];

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1696237583261-029171ee31fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMGV4dGVyaW9yfGVufDF8fHx8MTc1OTc3OTIwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Villa Exterior"
                className="w-full h-80 object-cover rounded-2xl shadow-lg"
              />
            </div>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1636728797208-4ccf0ffe119c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YWNhdGlvbiUyMGhvbWUlMjBsaXZpbmclMjByb29tfGVufDF8fHx8MTc1OTg3MDg5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Living Room"
              className="w-full h-64 object-cover rounded-2xl shadow-lg"
            />
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1715245926272-91bdc5f9b1db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdXRkb29yJTIwcG9vbCUyMHZpbGxhfGVufDF8fHx8MTc1OTg3MDg5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Pool Area"
              className="w-full h-64 object-cover rounded-2xl shadow-lg"
            />
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 bg-gray-100 rounded-full">
                <p className="text-sm text-gray-600 tracking-wide uppercase">
                  Discover
                </p>
              </div>
              <h2 className="text-4xl lg:text-5xl text-gray-900 tracking-tight">
                A Sanctuary of Luxury & Comfort
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Nestled in the heart of the Mediterranean coast, Villa Serenity
                offers an unparalleled vacation experience. Our thoughtfully
                designed property combines contemporary elegance with coastal
                charm, creating the perfect setting for your dream getaway.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                From the moment you arrive, you'll be captivated by breathtaking
                ocean views, meticulously landscaped gardens, and an infinity
                pool that seems to merge with the horizon. Every detail has been
                carefully curated to ensure your stay is nothing short of
                extraordinary.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 pt-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="p-6 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <Icon className="h-8 w-8 text-gray-900 mb-3" />
                    <p className="text-2xl text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

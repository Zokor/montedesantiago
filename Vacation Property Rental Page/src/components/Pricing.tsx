import { Check } from "lucide-react";
import { Button } from "./ui/button";

export function Pricing() {
  const seasons = [
    {
      name: "Low Season",
      period: "November - March",
      price: "$450",
      priceUnit: "per night",
      description: "Perfect for peaceful getaways",
      features: [
        "Minimum 3 nights",
        "All amenities included",
        "Concierge service",
        "Welcome package",
        "Daily housekeeping",
      ],
      highlight: false,
    },
    {
      name: "Mid Season",
      period: "April - May, October",
      price: "$650",
      priceUnit: "per night",
      description: "Ideal weather and great value",
      features: [
        "Minimum 5 nights",
        "All amenities included",
        "Priority concierge",
        "Premium welcome package",
        "Daily housekeeping",
        "Complimentary airport transfer",
      ],
      highlight: true,
    },
    {
      name: "High Season",
      period: "June - September",
      price: "$950",
      priceUnit: "per night",
      description: "Peak summer experience",
      features: [
        "Minimum 7 nights",
        "All amenities included",
        "VIP concierge service",
        "Deluxe welcome package",
        "Twice daily housekeeping",
        "Complimentary airport transfer",
        "Private chef available",
      ],
      highlight: false,
    },
  ];

  const scrollToContact = () => {
    const element = document.getElementById("contact");
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
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 bg-white rounded-full border border-gray-200 mb-4">
            <p className="text-sm text-gray-600 tracking-wide uppercase">
              Pricing
            </p>
          </div>
          <h2 className="text-4xl lg:text-5xl text-gray-900 tracking-tight mb-4">
            Seasonal Rates
          </h2>
          <p className="text-lg text-gray-600">
            Choose the perfect time for your stay. All rates include full access
            to amenities and premium services.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {seasons.map((season, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                season.highlight
                  ? "bg-gray-900 text-white shadow-2xl scale-105 border-2 border-gray-900"
                  : "bg-white shadow-sm hover:shadow-md border border-gray-200"
              }`}
            >
              {season.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`text-2xl mb-2 ${
                    season.highlight ? "text-white" : "text-gray-900"
                  }`}
                >
                  {season.name}
                </h3>
                <p
                  className={`text-sm mb-4 ${
                    season.highlight ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {season.period}
                </p>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-5xl ${
                      season.highlight ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {season.price}
                  </span>
                  <span
                    className={`text-lg ${
                      season.highlight ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {season.priceUnit}
                  </span>
                </div>
                <p
                  className={`text-sm mt-2 ${
                    season.highlight ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {season.description}
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {season.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <Check
                      className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        season.highlight ? "text-blue-400" : "text-gray-900"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        season.highlight ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={scrollToContact}
                className={`w-full ${
                  season.highlight
                    ? "bg-white text-gray-900 hover:bg-gray-100"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                Book Now
              </Button>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="text-gray-900 mb-2">Special Offers</h4>
            <p className="text-sm text-gray-600">
              Book 14+ nights and receive 15% off. Monthly rates available on
              request. Last-minute deals during low season.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="text-gray-900 mb-2">Cancellation Policy</h4>
            <p className="text-sm text-gray-600">
              Free cancellation up to 30 days before check-in. 50% refund for
              cancellations 14-30 days prior. Non-refundable within 14 days.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

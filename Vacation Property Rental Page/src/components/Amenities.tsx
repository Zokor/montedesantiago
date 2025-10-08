import {
  Wifi,
  Car,
  Wind,
  Tv,
  UtensilsCrossed,
  Waves,
  Dumbbell,
  Sparkles,
  Coffee,
  Baby,
  Snowflake,
  ShowerHead,
  Wine,
  Armchair,
  TreePine,
  Lock,
} from "lucide-react";

export function Amenities() {
  const amenityCategories = [
    {
      title: "Essential Amenities",
      amenities: [
        { icon: Wifi, name: "High-Speed WiFi", description: "500 Mbps fiber" },
        { icon: Wind, name: "Air Conditioning", description: "Throughout property" },
        { icon: Car, name: "Free Parking", description: "2 covered spaces" },
        { icon: Coffee, name: "Coffee Station", description: "Nespresso machine" },
      ],
    },
    {
      title: "Entertainment & Leisure",
      amenities: [
        { icon: Tv, name: "Smart TVs", description: "65\" in living room" },
        { icon: Waves, name: "Infinity Pool", description: "Heated & saltwater" },
        { icon: Dumbbell, name: "Fitness Room", description: "Fully equipped gym" },
        { icon: Wine, name: "Wine Cellar", description: "Climate controlled" },
      ],
    },
    {
      title: "Kitchen & Dining",
      amenities: [
        { icon: UtensilsCrossed, name: "Gourmet Kitchen", description: "Professional appliances" },
        { icon: Snowflake, name: "Wine Cooler", description: "Dual zone fridge" },
        { icon: Armchair, name: "Outdoor Dining", description: "Seats 12 guests" },
        { icon: Sparkles, name: "BBQ Grill", description: "Built-in gas grill" },
      ],
    },
    {
      title: "Comfort & Safety",
      amenities: [
        { icon: ShowerHead, name: "Luxury Bathrooms", description: "Rain showers & tubs" },
        { icon: Baby, name: "Family Friendly", description: "High chair & crib" },
        { icon: TreePine, name: "Private Garden", description: "Landscaped grounds" },
        { icon: Lock, name: "Security System", description: "24/7 monitoring" },
      ],
    },
  ];

  return (
    <section id="amenities" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 bg-white rounded-full border border-gray-200 mb-4">
            <p className="text-sm text-gray-600 tracking-wide uppercase">
              Amenities
            </p>
          </div>
          <h2 className="text-4xl lg:text-5xl text-gray-900 tracking-tight mb-4">
            Everything You Need for a Perfect Stay
          </h2>
          <p className="text-lg text-gray-600">
            From modern conveniences to luxury touches, our villa is equipped
            with everything to make your vacation unforgettable.
          </p>
        </div>

        {/* Amenities Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {amenityCategories.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl text-gray-900 mb-6">{category.title}</h3>
              <div className="space-y-4">
                {category.amenities.map((amenity, amenityIndex) => {
                  const Icon = amenity.icon;
                  return (
                    <div key={amenityIndex} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-gray-900" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-gray-900 mb-1">{amenity.name}</p>
                        <p className="text-sm text-gray-600">
                          {amenity.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Special Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-8 border border-blue-200/50">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl text-gray-900 mb-2">Concierge Service</h3>
            <p className="text-gray-600">
              Personal concierge available to arrange activities, reservations,
              and special requests.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-8 border border-green-200/50">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl text-gray-900 mb-2">Housekeeping</h3>
            <p className="text-gray-600">
              Daily housekeeping service to keep your villa pristine throughout
              your stay.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-8 border border-purple-200/50">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl text-gray-900 mb-2">Welcome Package</h3>
            <p className="text-gray-600">
              Complimentary welcome basket with local delicacies and premium
              beverages.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

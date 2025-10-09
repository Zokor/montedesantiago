import { MapPin, Clock, Car } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function NearbyAttractions() {
  const attractions = [
    {
      name: "Mediterranean Beach",
      description: "Pristine sandy beach with crystal-clear waters",
      distance: "2 min walk",
      driveTime: "Walking distance",
      category: "Beach",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    },
    {
      name: "Old Town Center",
      description: "Historic quarter with charming cafes and boutiques",
      distance: "1.5 km",
      driveTime: "5 min drive",
      category: "Culture",
      image: "https://images.unsplash.com/photo-1555990793-da11153b2473?w=800",
    },
    {
      name: "Marina & Yacht Club",
      description: "Luxury marina with waterfront restaurants",
      distance: "3 km",
      driveTime: "8 min drive",
      category: "Dining",
      image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800",
    },
    {
      name: "Golf Course",
      description: "Championship 18-hole course with ocean views",
      distance: "5 km",
      driveTime: "10 min drive",
      category: "Sports",
      image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800",
    },
    {
      name: "Wine Region",
      description: "Award-winning vineyards and tasting rooms",
      distance: "15 km",
      driveTime: "20 min drive",
      category: "Wine",
      image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800",
    },
    {
      name: "National Park",
      description: "Hiking trails and stunning coastal scenery",
      distance: "12 km",
      driveTime: "18 min drive",
      category: "Nature",
      image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
    },
  ];

  const essentials = [
    { name: "Supermarket", distance: "800 m", time: "3 min" },
    { name: "Pharmacy", distance: "1.2 km", time: "4 min" },
    { name: "Hospital", distance: "5 km", time: "10 min" },
    { name: "Airport", distance: "35 km", time: "30 min" },
    { name: "Train Station", distance: "8 km", time: "12 min" },
    { name: "Shopping Mall", distance: "6 km", time: "12 min" },
  ];

  return (
    <section id="nearby" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 bg-gray-100 rounded-full mb-4">
            <p className="text-sm text-gray-600 tracking-wide uppercase">
              Location
            </p>
          </div>
          <h2 className="text-4xl lg:text-5xl text-gray-900 tracking-tight mb-4">
            Discover the Area
          </h2>
          <p className="text-lg text-gray-600">
            Perfectly positioned for exploring the best of the Mediterranean
            coast, with attractions and amenities close by.
          </p>
        </div>

        {/* Attractions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {attractions.map((attraction, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={attraction.image}
                  alt={attraction.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full">
                  <p className="text-xs text-gray-900">{attraction.category}</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl text-gray-900 mb-2">
                  {attraction.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {attraction.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{attraction.distance}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Car className="h-4 w-4" />
                    <span>{attraction.driveTime}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Essential Services */}
        <div className="bg-gray-50 rounded-2xl p-8 lg:p-12 border border-gray-200">
          <div className="mb-8">
            <h3 className="text-2xl text-gray-900 mb-2">Essential Services</h3>
            <p className="text-gray-600">
              Everything you need is conveniently located nearby
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {essentials.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-gray-900" />
                  </div>
                  <div>
                    <p className="text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.distance}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="mt-12 rounded-2xl overflow-hidden border border-gray-200 h-[500px]">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  );
}

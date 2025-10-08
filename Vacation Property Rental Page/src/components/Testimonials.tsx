import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah & Michael Thompson",
      location: "London, UK",
      avatar: "https://i.pravatar.cc/150?img=1",
      rating: 5,
      date: "September 2024",
      text: "Villa Serenity exceeded all our expectations! The attention to detail, stunning ocean views, and impeccable service made our anniversary trip truly unforgettable. We can't wait to return.",
    },
    {
      name: "David Chen",
      location: "San Francisco, USA",
      avatar: "https://i.pravatar.cc/150?img=12",
      rating: 5,
      date: "August 2024",
      text: "This is the perfect family vacation spot. The villa had everything we needed - the kids loved the pool, and we enjoyed the peaceful terrace. The concierge team was incredibly helpful with restaurant recommendations.",
    },
    {
      name: "Emma & James Wilson",
      location: "Sydney, Australia",
      avatar: "https://i.pravatar.cc/150?img=5",
      rating: 5,
      date: "July 2024",
      text: "We've stayed at many luxury villas around the world, and this one ranks at the very top. The combination of modern amenities, beautiful design, and stunning location is unbeatable. Highly recommended!",
    },
    {
      name: "Maria Rodriguez",
      location: "Barcelona, Spain",
      avatar: "https://i.pravatar.cc/150?img=9",
      rating: 5,
      date: "June 2024",
      text: "An absolutely magical experience! The villa is even more beautiful in person than in photos. The proximity to the beach and local attractions made exploring easy, while the villa itself was our perfect retreat.",
    },
    {
      name: "Robert & Lisa Anderson",
      location: "Toronto, Canada",
      avatar: "https://i.pravatar.cc/150?img=8",
      rating: 5,
      date: "May 2024",
      text: "We celebrated our 25th anniversary here and it was perfect. The welcome package was a lovely touch, housekeeping was excellent, and the villa's amenities made us feel like royalty. Thank you for the memories!",
    },
    {
      name: "Sophie Laurent",
      location: "Paris, France",
      avatar: "https://i.pravatar.cc/150?img=10",
      rating: 5,
      date: "April 2024",
      text: "Exceptional in every way. The villa is beautifully maintained, the location is ideal, and the entire booking process was seamless. This will definitely be our go-to destination for future Mediterranean vacations.",
    },
  ];

  const stats = [
    { label: "Average Rating", value: "5.0" },
    { label: "Total Reviews", value: "250+" },
    { label: "Return Guests", value: "85%" },
    { label: "Response Time", value: "< 1 hour" },
  ];

  return (
    <section id="testimonials" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 bg-white rounded-full border border-gray-200 mb-4">
            <p className="text-sm text-gray-600 tracking-wide uppercase">
              Testimonials
            </p>
          </div>
          <h2 className="text-4xl lg:text-5xl text-gray-900 tracking-tight mb-4">
            What Our Guests Say
          </h2>
          <p className="text-lg text-gray-600">
            Don't just take our word for it - hear from guests who've experienced
            the magic of Villa Serenity.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 text-center border border-gray-200"
            >
              <p className="text-4xl text-gray-900 mb-2">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Quote Icon */}
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <Quote className="h-6 w-6 text-gray-900" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                  <p className="text-xs text-gray-500">{testimonial.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 text-center">
          <h3 className="text-3xl text-white mb-4">
            Ready to Create Your Own Memories?
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Join hundreds of satisfied guests who've experienced the luxury and
            comfort of Villa Serenity. Your perfect Mediterranean getaway awaits.
          </p>
          <button
            onClick={() => {
              const element = document.getElementById("contact");
              if (element) {
                const offset = 80;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition =
                  elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                  top: offsetPosition,
                  behavior: "smooth",
                });
              }
            }}
            className="px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            Book Your Stay Today
          </button>
        </div>
      </div>
    </section>
  );
}

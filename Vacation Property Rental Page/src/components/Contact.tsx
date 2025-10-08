import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner@2.0.3";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData);
    
    toast.success("Booking inquiry sent successfully!", {
      description: "We'll get back to you within 24 hours.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      checkIn: "",
      checkOut: "",
      guests: "",
      message: "",
    });
  };

  const contactInfo = [
    {
      icon: Phone,
      label: "Phone",
      value: "+1 (555) 123-4567",
      link: "tel:+15551234567",
    },
    {
      icon: Mail,
      label: "Email",
      value: "info@villaserenity.com",
      link: "mailto:info@villaserenity.com",
    },
    {
      icon: MapPin,
      label: "Address",
      value: "123 Coastal Drive, Mediterranean Coast",
      link: "#",
    },
  ];

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 bg-gray-100 rounded-full mb-4">
            <p className="text-sm text-gray-600 tracking-wide uppercase">
              Contact
            </p>
          </div>
          <h2 className="text-4xl lg:text-5xl text-gray-900 tracking-tight mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-600">
            Ready to book your dream vacation? Send us a message and we'll
            respond within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Contact Form */}
          <div className="bg-gray-50 rounded-2xl p-8 lg:p-12 border border-gray-200">
            <h3 className="text-2xl text-gray-900 mb-6">
              Send Us a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-white"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-white"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-white"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="checkIn">Check-in Date</Label>
                  <Input
                    id="checkIn"
                    name="checkIn"
                    type="date"
                    value={formData.checkIn}
                    onChange={handleChange}
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOut">Check-out Date</Label>
                  <Input
                    id="checkOut"
                    name="checkOut"
                    type="date"
                    value={formData.checkOut}
                    onChange={handleChange}
                    required
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests">Number of Guests</Label>
                <Input
                  id="guests"
                  name="guests"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.guests}
                  onChange={handleChange}
                  required
                  className="bg-white"
                  placeholder="2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="bg-white resize-none"
                  placeholder="Tell us about your perfect vacation..."
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Inquiry
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl text-gray-900 mb-6">
                Contact Information
              </h3>
              <div className="space-y-4">
                {contactInfo.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={index}
                      href={item.link}
                      className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-gray-900" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          {item.label}
                        </p>
                        <p className="text-gray-900">{item.value}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 h-[400px]">
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

            {/* Quick Info */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8">
              <h4 className="text-xl text-white mb-4">
                Quick Response Guarantee
              </h4>
              <p className="text-gray-300 mb-4">
                We pride ourselves on excellent customer service. All inquiries
                receive a response within 1 hour during business hours (9 AM - 9
                PM local time).
              </p>
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Available now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

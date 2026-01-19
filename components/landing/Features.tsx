import { FaBolt, FaShieldAlt, FaMapMarkedAlt, FaWallet } from "react-icons/fa";

const features = [
    {
        icon: <FaBolt className="w-6 h-6 text-brand-green" />,
        title: "Instant Match",
        description: "Get connected with available artisans in your area within minutes."
    },
    {
        icon: <FaShieldAlt className="w-6 h-6 text-brand-green" />,
        title: "Verified Pros",
        description: "Every artisan is vetted and verified to ensure safety and quality."
    },
    {
        icon: <FaMapMarkedAlt className="w-6 h-6 text-brand-green" />,
        title: "Real-time Tracking",
        description: "Track your artisan's arrival in real-time, just like a ride-share."
    },
    {
        icon: <FaWallet className="w-6 h-6 text-brand-green" />,
        title: "Transparent Pricing",
        description: "Know the cost upfront. Secure payments through the app."
    }
];

export default function Features() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose HandyFlow?</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        We make home maintenance stress-free by bringing trusted professionals to your doorstep.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 bg-white">
                            <div className="w-12 h-12 bg-brand-green-50 rounded-lg flex items-center justify-center mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

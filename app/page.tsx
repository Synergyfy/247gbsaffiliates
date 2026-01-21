'use client'
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import ExtraSections from "@/components/landing/ExtraSections";

const NARRATIVES = [
  {
    title: "Crafting Your Home with Precision.",
    subtitle: "Connect with elite artisans and master craftsmen for your home's most essential needs.",
    image: "https://images.unsplash.com/photo-1581578731548-c64695ce6958?q=80&w=2670&auto=format&fit=crop",
    color: "from-green-600 to-green-800"
  },
  {
    title: "Expertise That Transmutes Spaces.",
    subtitle: "Experience seamless home transformations with vetted professionals dedicated to quality.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop",
    color: "from-blue-600 to-blue-800"
  },
  {
    title: "Your Vision, Our Mastery.",
    subtitle: "From intricate woodwork to complex electrical, we bring the best artisans to your doorstep.",
    image: "https://images.unsplash.com/photo-1541604193435-225878996ac3?q=80&w=2670&auto=format&fit=crop",
    color: "from-orange-600 to-orange-800"
  }
];

const TESTIMONIALS = [
  {
    text: "Artisans saved my renovation. The carpenter they sent was incredibly skilled and finished the custom shelving in just two days.",
    name: "Sarah Jenkins",
    role: "Homeowner",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhaMMVBB_XUigfwWdQJeWuHqwKJ6E8m-vaHAcbWHuMfW1LUOZB8Dxg0kpb1yUj9dH1R-kU1k6Jo1rM3g96Rkvy9WfraqHq5UYTPkDzA9QlJBVRXO4AP1MiSZQZmucglYioBR739u7uVjhx5WOVFfiOhynCPQcYrEaC2Sbe-3f6-yYN-Jw9MX3B1BezfhiFpj5kzYqtVu9M8Zf2gzK7DHuK9_fya-9Ox_F_d69ZZp_51Ol6lbxfnzGapc0Cxf41SiGabelIJEFQXjR1"
  },
  {
    text: "Had a plumbing emergency at 10 PM. Used the app and had a verified plumber at my door within the hour. Lifesavers!",
    name: "Michael Chen",
    role: "Business Owner",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzJFq9xuaiBrPWyi5SpneAEy09aEeCH7IwiaUmRb7JhCQt352lfkKeQb-W8l11pcKf7T4owm2XM1CQGT9DvtNFkK9oV9kE8H_Y4M-o3ReUFj3swpiOwacaYu011ykyqq6veVBil4NYldg0Lfz3VYgoCeE7HKWOLFgfC-XIPFnW_hLY7QL5VdnMP4UCjYirZd5KC3oW2WP593c6kLT9OQ46Eli5HCg66uglRbvaIBcXdu2HaXYJW2711e8RtvA6uSjzyQwn_n-yRVvZ"
  },
  {
    text: "Excellent service for painting my entire apartment. The team was clean, professional, and the upfront pricing meant no haggling.",
    name: "David Ross",
    role: "Interior Designer",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBL0xHb7rw9UXhmcR5qNqQVGXQXElh8WC5IAL_cQLhTekFWh9U-yrlkpnMRx2xHlEZN3aGp4reY9ij7axQbF26vHYS557uf33wIvP9PG9oF2HVNZ2Vl-0GTV9gIMuW1pIIwULGhnJtlo6orFAPkCD9Fby-KyiWceQnVaQCNVBjs1FF4wxAq6UKVQpXLwJ7rzo8UrR-ZarFTUpkJI8CxSlqhgoxgRPwEt6HQqODK5wVjxerRbbyksl_ZlYzNM2T5YvhbC2I9QyEp7FYR"
  },
  {
    text: "Finding a reliable electrician used to be a nightmare. Artisans made it seamless and safe.",
    name: "Elena Rodriguez",
    role: "Restaurant Manager",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100&auto=format&fit=crop"
  }
];

export default function Home() {
  const [currentNarrative, setCurrentNarrative] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentNarrative((prev) => (prev + 1) % NARRATIVES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen font-display bg-background-light text-[#0e1a13] transition-colors duration-300">
      <Navigation />

      <main className="relative min-h-[90vh] flex flex-col lg:flex-row items-center pt-32 pb-20 px-6 lg:px-20 overflow-hidden">
        {/* Left Content Area (55%) */}
        <div className="w-full lg:w-[55%] flex flex-col gap-8 pr-0 lg:pr-24 z-10">
          {/* Social Proof Bubble */}
          <div className="flex items-center gap-3 bg-white/50 p-1.5 pr-4 rounded-full w-fit border border-primary/10 backdrop-blur-md">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="size-9 rounded-full border-2 border-white bg-cover bg-center"
                  style={{ backgroundImage: `url('https://i.pravatar.cc/100?img=${i + 10}')` }}
                ></div>
              ))}
              <div className="size-9 rounded-full border-2 border-white flex items-center justify-center bg-primary-light/20 text-primary text-xs font-bold font-sans">
                +12
              </div>
            </div>
            <span className="text-sm font-semibold text-charcoal/80">Joined by 15k+ homeowners</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentNarrative}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col gap-6"
            >
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-gradient">
                {NARRATIVES[currentNarrative].title}
              </h1>
              <p className="text-lg lg:text-xl text-charcoal/70 max-w-lg leading-relaxed font-medium">
                {NARRATIVES[currentNarrative].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/explore"
              className="min-w-[200px] bg-primary text-white h-14 px-8 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
            >
              Find an Expert
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </Link>
            <Link
              href="/signup"
              className="min-w-[200px] border-2 border-primary/20 text-primary h-14 px-8 rounded-xl font-bold text-lg hover:bg-primary/5 transition-all text-center flex items-center justify-center"
            >
              Become a Pro
            </Link>
          </div>
        </div>

        {/* Right Visual Area (45%) */}
        <div className="w-full lg:w-[45%] mt-16 lg:mt-0 relative group min-h-[500px] grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentNarrative}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="relative w-full aspect-4/5 asymmetric-frame overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-transparent z-10"></div>
              <img
                src={NARRATIVES[currentNarrative].image}
                alt="Narrative Visual"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </motion.div>
          </AnimatePresence>

          {/* Floating Quick Search Bar */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[110%] lg:w-[120%] lg:-left-20 lg:translate-x-0 z-30">
            <div className="glass-morphism p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2">
              <div className="flex-[1.5] flex items-center gap-3 px-5 py-4 bg-white/80 rounded-xl">
                <span className="material-symbols-outlined text-primary">search</span>
                <input
                  className="w-full border-none bg-transparent focus:ring-0 text-sm font-bold placeholder:text-gray-400 text-gray-900"
                  placeholder="What service do you need?"
                  type="text"
                />
              </div>
              <div className="flex-1 flex items-center gap-3 px-5 py-4 bg-white/80 rounded-xl border-l md:border-l-0">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <input
                  className="w-full border-none bg-transparent focus:ring-0 text-sm font-bold placeholder:text-gray-400 text-gray-900"
                  placeholder="Location"
                  type="text"
                />
              </div>
              <button className="bg-primary hover:bg-primary-dark text-white p-4 px-6 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-primary/20 active:scale-95 group">
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">search</span>
              </button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-12 -right-12 size-40 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 size-60 bg-primary-light/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </main>

      <section id="how-it-works" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 uppercase tracking-tighter">How Artisans Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">Three simple steps to getting your project done right. We've streamlined the process to connect you with the best.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-linear-to-r from-gray-200 via-green-500/30 to-gray-200 -z-10"></div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:bg-green-600 group-hover:text-white transition-all duration-300 border border-gray-100">
                <span className="material-icons-round text-4xl text-green-600 group-hover:text-white transition-colors">engineering</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Find Artisan</h3>
              <p className="text-gray-600">Search for the specific trade you need and browse profiles of verified local professionals.</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:bg-green-600 group-hover:text-white transition-all duration-300 border border-gray-100">
                <span className="material-icons-round text-4xl text-green-600 group-hover:text-white transition-colors">calendar_month</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. Book Service</h3>
              <p className="text-gray-600">Select a time that works for you and get an upfront price quote instantly.</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:bg-green-600 group-hover:text-white transition-all duration-300 border border-gray-100">
                <span className="material-icons-round text-4xl text-green-600 group-hover:text-white transition-colors">thumb_up_alt</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">3. Quality Work Guaranteed</h3>
              <p className="text-gray-600">Your satisfaction is our priority. Payment is only released when you're happy with the work.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Featured Categories</h2>
              <p className="text-gray-600">Expert help for every corner of your home.</p>
            </div>
            <a className="items-center text-green-600 font-semibold hover:text-green-800 transition-colors flex" href="#">
              View all services <span className="material-icons-round ml-1">arrow_forward</span>
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/explore?category=plumbing" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-green-500/30 transition-all group">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                <span className="material-icons-round text-2xl">plumbing</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">Plumbing</h3>
              <p className="text-sm text-gray-500">450+ Active Pros</p>
            </Link>
            <Link href="/explore?category=electrical" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-green-500/30 transition-all group">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                <span className="material-icons-round text-2xl">bolt</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">Electrical</h3>
              <p className="text-sm text-gray-500">320+ Active Pros</p>
            </Link>
            <Link href="/explore?category=carpentry" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-green-500/30 transition-all group">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 text-orange-600">
                <span className="material-icons-round text-2xl">carpenter</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">Carpentry</h3>
              <p className="text-sm text-gray-500">280+ Active Pros</p>
            </Link>
            <Link href="/explore?category=painting" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-green-500/30 transition-all group">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4 text-teal-600">
                <span className="material-icons-round text-2xl">format_paint</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">Painting</h3>
              <p className="text-sm text-gray-500">500+ Active Pros</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Choose Artisans?</h2>
              <p className="text-lg text-gray-600 mb-8">We are redefining home services with transparency, quality, and trust at the core of everything we do.</p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <span className="material-icons-round">verified_user</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-1">Verified Pros</h4>
                    <p className="text-gray-600">Every artisan undergoes a rigorous background check and skill assessment before joining our platform.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <span className="material-icons-round">price_check</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-1">Upfront Pricing</h4>
                    <p className="text-gray-600">Get a clear price estimate before the work begins. No surprise fees or hourly rate shocks.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <span className="material-icons-round">gpp_good</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-1">Customer Protection</h4>
                    <p className="text-gray-600">Our happiness guarantee covers your project up to ₦100,000 against damage or poor workmanship.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
                <img alt="Painter painting a wall" className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_v65byXEPE8b23pS8aVmKDrhFbQzSyxTLsfoIRcKY74Cjqfah--n3ieUG-rqUKvO8ozhMrbEl_ZNcGzsGTZpa6boxNwAZojkNQhIMhBE-iXxoRdRk9fUOLEk-v0C_zvIUlE3ziyBbnMNpRSIRKak22ln4EhuvJN0sOpxqI5Ni4mkrmH0j-48j8CmwwZNSsfbLKDUkLdWIJHpdrFzLQp_XgYChalVnm8xBAMoFxjcF2t_d1O29EvwwyXMUaJ9U8AqhjCLhTlc7UXuA" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-xs hidden md:block">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-icons-round text-yellow-500">star</span>
                  <span className="font-bold text-gray-900">TrustScore 4.9/5</span>
                </div>
                <p className="text-sm text-gray-500">Based on 10,000+ reviews from satisfied homeowners.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Common Questions</h2>
            <p className="text-lg text-gray-600">Everything you need to know about working with Artisans.</p>
          </div>

          <div className="space-y-4">
            {[
              { q: "How do you verify your artisans?", a: "We run comprehensive background checks, verify professional licenses, view past work portfolios, and conduct skill assessments for every artisan on our platform." },
              { q: "Is there a warranty on the work?", a: "Yes, all jobs booked through Artisans come with a Happiness Guarantee. If you're not satisfied, we'll work to make it right or refund you up to ₦100,000." },
              { q: "How is pricing determined?", a: "Artisans list fixed prices for common services (e.g., 'Install AC: ₦5,000'). For custom jobs, you'll receive a clear quote before work begins. No hidden hourly fees." },
              { q: "Can I book for the same day?", a: "Absolutely. Many of our artisans offer 'Available Now' slots for emergency repairs or urgent tasks, often arriving within hours." }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group">
                <details className="p-6 group-open:bg-gray-50 transition-colors cursor-pointer [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-bold text-lg text-gray-900 list-none">
                    {item.q}
                    <span className="material-icons-round text-gray-400 group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">{item.a}</p>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee Testimonials Section */}
      <section className="py-24 bg-white border-t border-gray-100 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Loved by Homeowners</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Don't just take our word for it. Here is what our community has to say.</p>
        </div>

        <div className="relative w-full flex flex-col gap-8">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-white to-transparent z-10 pointer-events-none"></div>

          {/* Row 1: Left Scroll */} 
          <motion.div
            className="flex gap-8 w-max"
            animate={{ x: [0, -2000] }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          >
            {[...TESTIMONIALS, ...TESTIMONIALS].map((testimonial, i) => (
              <div key={i} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 w-[400px] shrink-0 hover:border-green-200 hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <img alt={testimonial.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-white" src={testimonial.avatar} />
                    <div>
                      <h5 className="font-bold text-gray-900">{testimonial.name}</h5>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400 text-xs">
                    {[1, 2, 3, 4, 5].map(star => <span key={star} className="material-icons-round">star</span>)}
                  </div>
                </div>
                <p className="text-gray-600 italic leading-relaxed">"{testimonial.text}"</p>
              </div>
            ))}
          </motion.div>

          {/* Row 2: Right Scroll */} 
          <motion.div
            className="flex gap-8 w-max"
            animate={{ x: [-2000, 0] }}
            transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
          >
            {[...TESTIMONIALS, ...TESTIMONIALS].reverse().map((testimonial, i) => (
              <div key={i + 'rev'} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 w-[400px] shrink-0 hover:border-green-200 hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <img alt={testimonial.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-white" src={testimonial.avatar} />
                    <div>
                      <h5 className="font-bold text-gray-900">{testimonial.name}</h5>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400 text-xs">
                    {[1, 2, 3, 4, 5].map(star => <span key={star} className="material-icons-round">star</span>)}
                  </div>
                </div>
                <p className="text-gray-600 italic leading-relaxed">"{testimonial.text}"</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Join the Network Section */}
      <section className="py-32 bg-black relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDuration: '7s' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="text-green-500 font-bold tracking-widest uppercase text-sm mb-4 block">Join the Revolution</span>
          <h2 className="text-5xl md:text-7xl font-black mb-8 leading-none text-white tracking-tight">Ready to transform <br />your home experience?</h2>
          <p className="text-gray-400 text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
            Join thousands of homeowners and skilled artisans building the future of home maintenance together.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/signup" className="flex items-center gap-4 bg-green-600 text-white px-8 py-5 rounded-2xl hover:bg-green-500 hover:scale-105 transition-all group shadow-2xl shadow-green-900/20">
              <span className="text-left">
                <p className="text-[10px] uppercase font-bold text-green-100 leading-none mb-1">Get Started</p>
                <p className="text-xl font-black leading-none">Join as a Client</p>
              </span>
              <span className="material-icons-round text-3xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
            <Link href="/signup?role=artisan" className="flex items-center gap-4 bg-gray-900 border border-gray-800 text-white px-8 py-5 rounded-2xl hover:bg-gray-800 hover:scale-105 transition-all group">
              <span className="text-left">
                <p className="text-[10px] uppercase font-bold text-gray-500 leading-none mb-1">Grow your business</p>
                <p className="text-xl font-black leading-none">Become a Pro</p>
              </span>
              <span className="material-icons-round text-3xl text-gray-600 group-hover:text-white transition-colors">handyman</span>
            </Link>
          </div>
        </div>
      </section>

      <ExtraSections />

      <footer className="bg-gray-900 text-white pt-20 pb-10 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-green-600 text-white p-1.5 rounded-lg">
                  <span className="material-icons-round text-xl">handyman</span>
                </div>
                <span className="text-xl font-bold tracking-tight">Artisans</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                We are dedicated to making home maintenance simple and stress-free. Verified artisans, upfront pricing, guaranteed quality.
              </p>
              <div className="flex space-x-4">
                <a className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-600 transition-colors text-gray-400 hover:text-white" href="#">
                  <span className="material-icons-round text-lg">facebook</span>
                </a>
                <a className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-600 transition-colors text-gray-400 hover:text-white" href="#">
                  <span className="material-icons-round text-lg">camera_alt</span>
                </a>
                <a className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-600 transition-colors text-gray-400 hover:text-white" href="#">
                  <span className="material-icons-round text-lg">alternate_email</span>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a className="hover:text-green-600 transition-colors" href="#">About Us</a></li>
                <li><a className="hover:text-green-600 transition-colors" href="#">Careers</a></li>
                <li><a className="hover:text-green-600 transition-colors" href="#">Press</a></li>
                <li><a className="hover:text-green-600 transition-colors" href="#">Blog</a></li>
                <li><a className="hover:text-green-600 transition-colors" href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6">Support</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a className="hover:text-green-600 transition-colors" href="#">Help Center</a></li>
                <li><a className="hover:text-green-600 transition-colors" href="#">Become a Pro</a></li>
                <li><a className="hover:text-green-600 transition-colors" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-green-600 transition-colors" href="#">Safety Guarantee</a></li>
                <li><a className="hover:text-green-600 transition-colors" href="#">Sitemap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6">Stay Updated</h4>
              <p className="text-gray-400 text-sm mb-4">Subscribe to our newsletter for home maintenance tips and exclusive offers.</p>
              <form className="space-y-3">
                <input className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent text-sm text-white placeholder-gray-500" placeholder="Your email address" type="email" />
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors" type="button">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Artisans Services. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link className="hover:text-white" href="/privacy">Privacy</Link>
              <Link className="hover:text-white" href="/terms">Terms</Link>
              <Link className="hover:text-white" href="/cookies">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { HeroCarousel } from "@/components/landing/HeroCarousel";
import { FaNairaSign } from "react-icons/fa6";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light text-text-main selection:bg-primary/20">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-solid border-primary/5 bg-background-light/80 backdrop-blur-md px-6 lg:px-40 py-4">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <div className="size-8">
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-text-main text-2xl font-bold font-display tracking-tight">247gds affiliate</h2>
          </div>
          <div className="hidden md:flex flex-1 justify-center gap-10">
            <Link href="#" className="text-text-main/80 text-sm font-semibold hover:text-primary transition-colors">For Accountants</Link>
            <Link href="#" className="text-text-main/80 text-sm font-semibold hover:text-primary transition-colors">For Agents</Link>
            <Link href="#" className="text-text-main/80 text-sm font-semibold hover:text-primary transition-colors">For consultants</Link>
            <Link href="#" className="text-text-main/80 text-sm font-semibold hover:text-primary transition-colors">How it Works</Link>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="hidden sm:flex min-w-[100px] items-center justify-center rounded-xl h-11 px-6 bg-white text-text-main text-sm font-semibold border border-primary/10 hover:bg-slate-50 transition-all font-display">
              Login
            </Link>
            <Link href="/role-selection" className="flex min-w-[110px] items-center justify-center rounded-xl h-11 px-6 bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-display">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 lg:px-40 py-12 lg:py-20 flex justify-center">
        <div className="max-w-[1240px] w-full">
          <HeroCarousel />
        </div>
      </section>

      {/* Trust Bar */}
      <section className="px-6 lg:px-40 py-12 border-y border-primary/5 bg-white">
        <div className="mx-auto max-w-[1240px]">
          <h4 className="text-text-secondary text-xs font-bold uppercase tracking-[0.2em] mb-12 text-center opacity-70">Trusted by industry leaders worldwide</h4>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="text-text-main font-bold opacity-50 text-xl font-display">GOOGLE</div>
            <div className="text-text-main font-bold opacity-50 text-xl font-display">META</div>
            <div className="text-text-main font-bold opacity-50 text-xl font-display">AMAZON</div>
            <div className="text-text-main font-bold opacity-50 text-xl font-display">MICROSOFT</div>
            <div className="text-text-main font-bold opacity-50 text-xl font-display">NETFLIX</div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="px-6 lg:px-40 py-24 flex justify-center bg-white">
        <div className="max-w-[1240px] w-full">
          <div className="flex flex-col gap-20 text-center items-center">
            <div className="space-y-4">
              <span className="text-primary font-bold tracking-widest uppercase text-xs">Innovation Focused</span>
              <h2 className="text-text-main tracking-tight text-4xl lg:text-5xl font-bold font-display leading-tight max-w-[900px]">
                Engineered for Precision and Scale
              </h2>
              <p className="text-text-secondary text-lg lg:text-xl font-medium max-w-[700px] mx-auto leading-relaxed">
                We've reinvented the marketplace for professional commerce. No more guesswork, just data-driven matching for elite stakeholders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
              {[
                { title: "Verified Expertise", desc: "Integrated Quismatic assessments ensure all talent meets elite performance standards before they enter your ecosystem.", icon: "verified_user", color: "bg-blue-600" },
                { title: "Role-Based Tools", desc: "Tailored dashboards and enterprise-grade management tools designed specifically for Consulatants, Agents, and Account managers.", icon: "dashboard_customize", color: "bg-primary" },
                { title: "Scalable Growth", desc: "Accelerate your professional network with streamlined campaign management and automated talent pipeline scaling.", icon: "rocket_launch", color: "bg-primary" }
              ].map((feature, i) => (
                <div key={i} className="group flex flex-col gap-8 rounded-[2.5rem] border border-primary/5 bg-background-light p-12 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                  <div className={`flex size-16 items-center justify-center rounded-2xl ${feature.color} text-white shadow-xl transition-transform group-hover:rotate-12`}>
                    <span className="material-symbols-outlined text-4xl">{feature.icon}</span>
                  </div>
                  <div className="flex flex-col gap-4 relative z-10">
                    <h3 className="text-text-main text-2xl font-bold font-display tracking-tight">{feature.title}</h3>
                    <p className="text-text-secondary text-base lg:text-lg leading-relaxed font-medium">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 lg:px-40 py-24 bg-primary text-white">
        <div className="max-w-[1240px] mx-auto grid grid-cols-3 md:grid-cols-3 gap-12 text-center">
          {[
            { label: "Active Merchants", value: "2.5k+" },
            { label: "Verified Agents", value: "12k+" },
            { label: "Match Accuracy", value: "99.2%" }
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <p className="text-4xl lg:text-5xl font-bold font-display">{stat.value}</p>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-6 lg:px-40 py-24 flex justify-center bg-white">
        <div className="max-w-[1240px] w-full">
          <div className="text-center mb-16 space-y-4">
            <span className="text-primary font-bold tracking-widest uppercase text-sm">Marketplace</span>
            <h2 className="text-4xl lg:text-5xl font-bold font-display text-text-main">Browse by Role</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">Discover elite professionals across various disciplines in our specialized ecosystem.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { name: " Agents", count: "2.1k+", icon: "support_agent" },
              { name: "Consultants", count: "400+", icon: "architecture" },
              { name: "Account Managers", count: "320+", icon: "badge" },
            ].map((cat, i) => (
              <Link href="#" key={i} className="p-8 rounded-2xl border border-primary/5 bg-background-light hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all group">
                <span className="material-symbols-outlined text-primary text-3xl mb-4 group-hover:scale-110 transition-transform">{cat.icon}</span>
                <h4 className="text-text-main font-bold font-display mb-1">{cat.name}</h4>
                <p className="text-text-secondary text-sm font-medium">{cat.count} Active</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 lg:px-40 py-24 flex justify-center bg-background-light">
        <div className="max-w-[1240px] w-full flex flex-col lg:flex-row gap-24 items-center">
          <div className="flex-1 flex flex-col gap-12">
            <div className="space-y-6 text-center lg:text-left">
              <span className="text-primary font-bold tracking-widest uppercase text-sm">A Transparent Process</span>
              <h2 className="text-5xl lg:text-6xl font-bold font-display text-text-main leading-tight tracking-tight">How it Works</h2>
              <p className="text-text-secondary text-lg lg:text-xl font-medium leading-relaxed">The simplified path from professional discovery to successful placements in three clear phases.</p>
            </div>

            <div className="flex flex-col gap-12 mt-4">
              {[
                { step: "01", title: "Professional Profile", desc: "Build your professional portfolio highlighting your specific agent, merchant or consultant skills." },
                { step: "02", title: "Quismatic Verification", desc: "Complete the mandatory expertise quiz to earn your Elite Verified status badge and trust." },
                { step: "03", title: "Connect & Scale", desc: "Matched directly with top-tier partners looking for your specific commerce expertise." }
              ].map((item, i) => (
                <div key={i} className="flex gap-10 group items-start">
                  <div className="flex-none flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-white shadow-2xl text-primary font-bold font-display text-3xl border border-primary/5 transition-all group-hover:bg-primary group-hover:text-white">
                    {item.step}
                  </div>
                  <div className="pt-2">
                    <h4 className="text-2xl font-bold font-display mb-3 text-text-main transition-colors group-hover:text-primary">{item.title}</h4>
                    <p className="text-text-secondary text-lg font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full max-w-xl">
            <div className="aspect-square rounded-3xl bg-white p-10 relative shadow-2xl overflow-hidden border border-primary/10">
              <div className="w-full h-full rounded-[3rem] overflow-hidden relative shadow-inner ring-1 ring-primary/5">
                <Image
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2026&auto=format&fit=crop"
                  alt="Commerce Performance Analytics"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 lg:px-40 py-24 bg-white overflow-hidden">
        <div className="max-w-[1240px] mx-auto text-center">
          <span className="text-primary font-bold tracking-widest uppercase text-sm">Testimonials</span>
          <h2 className="text-4xl lg:text-5xl font-bold font-display text-text-main mb-16 mt-4">What Elite Talent Says</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { name: "Sarah Jenkins", role: "Elite Merchant", text: "Mcommall transformed how we handle our logistics and partner matching. The verification process gives us immense confidence.", avatar: "https://i.pravatar.cc/150?u=sarah" },
              { name: "Marcus Chen", role: "Field Agent", text: "The role-based tools are a game changer. I can manage my entire client portfolio from one dashboard with zero friction.", avatar: "https://i.pravatar.cc/150?u=marcus" },
              { name: "Elena Rodriguez", role: "Consultant", text: "Data-driven matching actually works. I've been connected with higher quality opportunities than ever before.", avatar: "https://i.pravatar.cc/150?u=elena" }
            ].map((testimonial, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] bg-background-light border border-primary/5 text-left flex flex-col gap-6">
                <p className="text-text-secondary text-lg font-medium">"{testimonial.text}"</p>
                <div className="flex items-center gap-4 mt-auto">
                  <img src={testimonial.avatar} alt={testimonial.name} className="size-12 rounded-full object-cover" />
                  <div>
                    <p className="text-text-main font-bold">{testimonial.name}</p>
                    <p className="text-primary text-xs font-bold uppercase tracking-widest">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Management Details */}
      <section className="px-6 lg:px-40 py-24 bg-background-light">
        <div className="max-w-[1240px] mx-auto text-center mb-20 space-y-4">
          <span className="text-primary font-bold tracking-widest uppercase text-sm">A Unified Ecosystem</span>
          <h2 className="text-4xl lg:text-5xl font-bold font-display text-text-main tracking-tight">One System, Three Roles</h2>
          <p className="text-text-secondary text-xl font-medium max-w-2xl mx-auto">Everything you need to manage modern commerce professionals.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-[1240px] mx-auto">
          {[
            { role: "Merchants", desc: "Manage storefronts, products, and inventory with elite precision and advanced analytics.", icon: "storefront", color: "bg-blue-600", features: ["Inventory Tracking", "Sales Analytics", "Payout Systems"] },
            { role: "Agents", desc: "Empower your field force to drive transactions and manage complex client portfolios.", icon: "support_agent", color: "bg-primary", features: ["Commission Automation", "Lead Management", "Support Tools"] },
            { role: "Consultants", desc: "Experience a premium commerce journey with personalized discovery and secure checkout.", icon: "shopping_bag", color: "bg-primary-dark", features: ["Personalized Feed", "Order History", "Loyalty Rewards"] }
          ].map((r, i) => (
            <div key={i} className="group p-12 rounded-4xl border border-primary/5 bg-white flex flex-col items-center text-center transition-all duration-500 hover:shadow-2xl hover:-translate-y-3">
              <div className={`w-24 h-24 rounded-4xl ${r.color} flex items-center justify-center text-white mb-10 shadow-2xl transition-transform`}>
                <span className="material-symbols-outlined text-5xl">{r.icon}</span>
              </div>
              <h4 className="text-3xl font-bold font-display text-text-main mb-6 uppercase tracking-tight">{r.role}</h4>
              <p className="text-text-secondary font-medium mb-10 text-lg leading-relaxed">{r.desc}</p>
              <div className="w-full h-px bg-slate-50 mb-10"></div>
              <ul className="space-y-6 text-text-main font-semibold text-base w-full">
                {r.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-4 justify-center text-sm lg:text-base">
                    <span className="material-symbols-outlined text-primary text-2xl">check_circle</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>


      {/* FAQ Section */}
      <section className="px-6 lg:px-40 py-24 flex justify-center bg-background-light">
        <div className="max-w-[800px] w-full">
          <div className="text-center mb-16 space-y-4">
            <span className="text-primary font-bold tracking-widest uppercase text-sm">FAQ</span>
            <h2 className="text-4xl lg:text-5xl font-bold font-display text-text-main">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "How does the verification process work?", a: "The Quismatic verification process involves a series of skills-based assessments tailored to your selected role. Once you pass, you earn the 'Elite' badge." },
              { q: "Can I switch roles later?", a: "Yes, you can manage multiple roles or switch your primary role from your dashboard settings, though some roles may require additional verification." },
              { q: "Is there a setup fee?", a: "No, there are no hidden setup fees. You can start with our Individual plan for free and upgrade as you grow." },
              { q: "How are payments handled?", a: "We use secure, enterprise-grade payout systems that support multiple currencies and automated commission tracking." }
            ].map((faq, i) => (
              <details key={i} className="group p-8 rounded-3xl bg-white border border-primary/5 cursor-pointer">
                <summary className="flex items-center justify-between font-bold font-display text-text-main list-none">
                  {faq.q}
                  <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <p className="text-text-secondary mt-4 leading-relaxed font-medium">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 lg:px-40 py-24 flex justify-center bg-white">
        <div className="max-w-[1100px] w-full rounded-3xl bg-primary px-8 py-24 text-center flex flex-col items-center gap-12 shadow-2xl shadow-primary/40 relative overflow-hidden group">
          <div className="relative z-10 space-y-8">
            <h2 className="text-white text-5xl lg:text-7xl font-bold font-display leading-tight tracking-tight">Ready to join the 247gds affiliate ecosystem?</h2>
            <p className="text-white/90 text-2xl font-medium max-w-[700px] mx-auto">Join hundreds of leading companies already scaling through verified elite talent on 247gds affiliate.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-8 relative z-10 pt-4">
            <Link href="/signup" className="bg-text-main text-white px-14 py-6 rounded-2xl text-xl font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all text-center font-display">Get Started Now</Link>
            <Link href="#" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-14 py-6 rounded-2xl text-xl font-bold hover:bg-white/20 transition-all text-center font-display">Contact Sales</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-primary/5 px-6 lg:px-40 py-24">
        <div className="mx-auto max-w-[1240px] grid grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24">
          <div className="col-span-2 lg:col-span-1 flex flex-col gap-10">
            <div className="flex items-center gap-3">
              <div className="size-8 text-primary">
                <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fillRule="evenodd"></path>
                </svg>
              </div>
              <h2 className="text-text-main text-3xl font-bold font-display tracking-tight">Mcommall</h2>
            </div>
            <p className="text-text-secondary text-lg font-medium leading-relaxed max-w-sm">The professional standard for commerce ecosystems. Verified, scalable, and built for modern business.</p>
            <div className="flex gap-4">
              {['public', 'terminal', 'share', 'contact_support'].map((icon, i) => (
                <a key={i} className="w-14 h-14 rounded-2xl bg-background-light border border-primary/5 flex items-center justify-center text-text-secondary hover:bg-primary hover:text-white hover:-translate-y-2 transition-all cursor-pointer shadow-sm">
                  <span className="material-symbols-outlined text-2xl">{icon}</span>
                </a>
              ))}
            </div>
          </div>
          {[
            { title: "Marketplace", links: ["Find Merchants", "Success Stories", "Pricing", "Enterprise"] },
            { title: "Resources", links: ["Help Center", "The Hub Blog", "For Professionals", "Community"] },
            { title: "Company", links: ["About Us", "Careers", "Privacy Policy", "Terms of Service"] }
          ].map((col, i) => (
            <div key={i} className="flex flex-col gap-10">
              <h4 className="text-text-main font-bold uppercase tracking-widest text-sm mb-2">{col.title}</h4>
              <ul className="flex flex-col gap-5 text-sm lg:text-base text-text-secondary font-medium">
                {col.links.map((link, j) => (
                  <li key={j}><Link href="#" className="hover:text-primary transition-colors underline-offset-4 hover:underline decoration-primary/30">{link}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto max-w-[1240px] mt-24 pt-12 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-8 text-xs lg:text-sm text-text-secondary font-bold uppercase tracking-[0.2em] opacity-60">
          <p>© {new Date().getFullYear()} 247gds affiliate professional marketplace</p>
          <div className="flex gap-12">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

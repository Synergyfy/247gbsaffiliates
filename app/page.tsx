import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight text-brand-green">
            HandyFlow
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="#" className="hover:text-brand-green transition-colors">Find Artisans</Link>
            <Link href="#" className="hover:text-brand-green transition-colors">Join as Pro</Link>
            <Link href="#" className="hover:text-brand-green transition-colors">How it Works</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:inline-flex">Log in</Button>
            <Button className="font-semibold">
              Get Started <FaArrowRight className="ml-2 w-3 h-3" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <Features />
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <span className="text-xl font-bold text-white mb-4 block">HandyFlow</span>
            <p className="text-sm">Connecting you with local experts.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white">Browse Pros</Link></li>
              <li><Link href="#" className="hover:text-white">How it works</Link></li>
              <li><Link href="#" className="hover:text-white">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white">About Us</Link></li>
              <li><Link href="#" className="hover:text-white">Careers</Link></li>
              <li><Link href="#" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white">Terms</Link></li>
              <li><Link href="#" className="hover:text-white">Privacy</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-6 border-t border-gray-800 pt-8 text-center text-sm">
          © {new Date().getFullYear()} HandyFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

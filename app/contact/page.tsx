import FadeIn from "@/components/FadeIn";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
    return (
        <main className="min-h-screen py-20 bg-gray-50">
            <div className="container mx-auto px-6 max-w-xl">
                <FadeIn direction="up">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Contact Us</h1>
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none" placeholder="Your name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input type="email" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none" placeholder="you@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none h-32" placeholder="How can we help?"></textarea>
                            </div>
                            <Button className="w-full h-12 text-lg">Send Message</Button>
                        </form>
                    </div>
                </FadeIn>
            </div>
        </main>
    );
}

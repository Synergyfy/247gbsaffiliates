import FadeIn from "@/components/FadeIn";

export default function AboutPage() {
  return (
    <main className="min-h-screen py-20 bg-gray-50">
      <div className="container mx-auto px-6 max-w-3xl">
        <FadeIn direction="up">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">About Artisans</h1>
          <div className="prose prose-lg text-gray-600">
            <p className="mb-6">
              Artisans is on a mission to revolutionize how people find and hire local artisans. We believe that getting help around the house should be as easy as ordering a ride.
            </p>
            <p className="mb-6">
              Founded in 2026, we noticed a gap in the market for reliable, verified professionals. Homeowners struggled to find trustworthy help, while skilled artisans struggled to find consistent work.
            </p>
            <p>
              Today, we connect thousands of clients with verified electricians, plumbers, fast-requests, and more, ensuring quality work and fair pay for everyone involved.
            </p>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}

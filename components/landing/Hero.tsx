import Link from "next/link";

interface HeroProps {
    badge: string;
    title: string;
    titleHighlight: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    imageUrl: string;
}

export default function LandingHero({
    badge,
    title,
    titleHighlight,
    description,
    ctaText,
    ctaLink,
    imageUrl,
}: HeroProps) {
    return (
        <section className="relative px-6 py-16 lg:px-12 lg:py-24">
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                    <div className="flex flex-col gap-8 order-2 lg:order-1">
                        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            {badge}
                        </div>
                        <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-text-main lg:text-7xl">
                            {title} <br />
                            <span className="text-primary">{titleHighlight}</span>
                        </h1>
                        <p className="max-w-xl text-lg leading-relaxed text-text-secondary">
                            {description}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href={ctaLink}
                                className="bg-primary text-white px-8 py-4 text-base font-extrabold rounded-lg shadow-xl shadow-primary/25 hover:translate-y-[-2px] hover:bg-primary-hover transition-all"
                            >
                                {ctaText}
                            </Link>
                            <button className="flex items-center gap-2 border-2 border-slate-200 px-8 py-4 text-base font-extrabold rounded-lg hover:bg-slate-50 transition-all text-text-main">
                                <span className="material-symbols-outlined">play_circle</span>
                                See How It Works
                            </button>
                        </div>
                    </div>
                    <div className="relative order-1 lg:order-2">
                        {/* Main Hero Image */}
                        <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl shadow-2xl">
                            <div className="absolute inset-0 bg-linear-to-tr from-black/40 to-transparent z-10"></div>
                            <img
                                alt="Professional workspace"
                                className="h-full w-full object-cover"
                                src={imageUrl}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

import Link from "next/link";

export default function LandingFooter() {
    return (
        <footer className="border-t border-slate-200 bg-surface-light px-6 py-12 lg:px-12">
            <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2 text-text-main">
                    <div className="size-6 text-primary">
                        <svg
                            fill="currentColor"
                            viewBox="0 0 48 48"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                clipRule="evenodd"
                                d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z"
                                fillRule="evenodd"
                            ></path>
                        </svg>
                    </div>
                    <span className="text-lg font-extrabold">247gbs affiliate</span>
                </div>
                <div className="flex gap-8 text-sm font-semibold text-text-secondary">
                    <Link className="hover:text-primary transition-colors" href="/privacy">
                        Privacy Policy
                    </Link>
                    <Link className="hover:text-primary transition-colors" href="/terms">
                        Terms of Service
                    </Link>
                    <Link className="hover:text-primary transition-colors" href="/support">
                        Support
                    </Link>
                </div>
                <p className="text-sm text-text-secondary">
                    © {new Date().getFullYear()} 247gbs affiliate. All rights reserved.
                </p>
            </div>
        </footer>
    );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const programs = [
    { name: "For Agents", href: "/for-agent" },
    { name: "For Consultants", href: "/for-consultant" },
    { name: "For Account Managers", href: "/for-account-manager" },
];

export default function ProgramsMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close the menu when clicking outside or pressing Escape
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                className="flex items-center gap-1 text-text-main/80 text-sm font-semibold hover:text-primary transition-colors cursor-pointer"
            >
                Programs
                <svg
                    className={`size-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                >
                    <path d="M5 7.5L10 12.5L15 7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-1/2 top-full z-50 mt-4 w-60 -translate-x-1/2 rounded-2xl border border-primary/10 bg-white p-2 shadow-xl shadow-primary/10">
                    {programs.map((program) => (
                        <Link
                            key={program.name}
                            href={program.href}
                            onClick={() => setIsOpen(false)}
                            className="block rounded-xl px-4 py-3 text-sm font-semibold text-text-main/80 hover:bg-primary/5 hover:text-primary transition-colors"
                        >
                            {program.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

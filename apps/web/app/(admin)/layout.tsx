import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Login - Listeo",
    description: "Secure admin access",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

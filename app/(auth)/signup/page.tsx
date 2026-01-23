import { Suspense } from "react";
import SignupPage from "@/components/auth/SignupMainPage";

export default function Signup() {
    return (
        <Suspense fallback={<div className="min-h-screen" />}>
            <SignupPage />
        </Suspense>
    );
}

import Link from "next/link";

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
            <div className="bg-surface-light border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-8 relative">
                <div className="absolute top-4 left-4">
                    <Link className="inline-flex items-center text-text-secondary hover:text-primary text-xs font-bold transition-all gap-1" href="/">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Home
                    </Link>
                </div>
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-text-main tracking-tight mb-2">
                        Admin Portal
                    </h1>
                    <p className="text-text-secondary">Sign in to manage the platform</p>
                </div>

                <form className="space-y-6">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-bold text-text-main mb-2"
                        >
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-4 py-3 rounded-xl bg-background-light border-transparent focus:bg-surface-light focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-bold text-text-main mb-2"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-4 py-3 rounded-xl bg-background-light border-transparent focus:bg-surface-light focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary"
                            />
                            <span className="text-sm font-semibold text-text-secondary">
                                Remember me
                            </span>
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-sm font-bold text-primary hover:text-primary-hover transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold tracking-wide shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5"
                    >
                        Sign In to Dashboard
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                    <p className="text-xs text-text-secondary font-medium">
                        Protected area. Authorized personnel only.
                    </p>
                </div>
            </div>
        </div>
    );
}

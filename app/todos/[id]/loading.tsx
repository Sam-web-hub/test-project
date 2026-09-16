import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

/**
 * Server Component loading skeleton for /todos/[id].
 * Prevents layout shift and provides shimmer feedback during streaming and cold starts.
 */
export default function TodoLoading() {
    return (
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen" aria-busy="true" aria-label="Loading todo details">
            <nav className="mb-4">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeftIcon className="size-3.5" aria-hidden />
                    <span>Back to todos</span>
                </Link>
            </nav>

            <article className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" aria-hidden="true">
                <header className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2.5">
                        <span className="bar bar-pill" style={{ width: "3.2rem" }} />
                        <span className="bar bar-pill" />
                    </div>
                    <span className="bar bar-btn" />
                </header>

                <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <span className="bar bar-title" />
                        <span className="bar bar-box" />
                    </div>
                </div>

                <footer className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
                    <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                            <dt className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Todo ID
                            </dt>
                            <dd className="mt-0.5">
                                <span className="bar" style={{ width: "2.5rem" }} />
                            </dd>
                        </div>
                        <div>
                            <dt className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Status
                            </dt>
                            <dd className="mt-0.5">
                                <span className="bar" style={{ width: "4rem" }} />
                            </dd>
                        </div>
                    </dl>
                </footer>
            </article>
        </main>
    );
}

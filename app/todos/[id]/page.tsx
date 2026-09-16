import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { DetailDelete } from "@/components/detail-delete";
import { DetailTitle } from "@/components/detail-title";
import { StatusToggle } from "@/components/status-toggle";
import { getTodo } from "@/lib/store";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const numId = Number(id);
    if (Number.isNaN(numId)) {
        return { title: "Todo Not Found" };
    }

    const todo = await getTodo(numId);
    if (!todo) {
        return { title: "Todo Not Found" };
    }

    return {
        title: `${todo.todo} | Todos`,
        description: `Details and management for todo #${todo.id}`,
    };
}

/**
 * Server Component.
 * Pure RSC rendering layout, card chrome, and metadata on the server.
 * Styled with Tailwind CSS matching the application's clean design theme.
 */
export default async function TodoPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const numId = Number(id);

    if (Number.isNaN(numId)) {
        notFound();
    }

    const todo = await getTodo(numId);
    if (!todo) {
        notFound();
    }

    return (
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
            <nav className="mb-4">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeftIcon className="size-3.5" aria-hidden />
                    <span>Back to todos</span>
                </Link>
            </nav>

            <article className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <header className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200/80">
                            #{todo.id}
                        </span>
                        <StatusToggle
                            id={todo.id}
                            completed={todo.completed}
                            label={todo.todo}
                        />
                    </div>
                    <DetailDelete id={todo.id} label={todo.todo} />
                </header>

                <div className="p-5 sm:p-6">
                    <DetailTitle
                        id={todo.id}
                        text={todo.todo}
                        completed={todo.completed}
                    />
                </div>

                <footer className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
                    <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                            <dt className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Todo ID
                            </dt>
                            <dd className="mt-0.5 text-sm font-medium text-slate-800">
                                #{todo.id}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Status
                            </dt>
                            <dd className="mt-0.5 text-sm font-medium text-slate-800">
                                {todo.completed ? "Completed" : "Pending"}
                            </dd>
                        </div>
                    </dl>
                </footer>
            </article>
        </main>
    );
}

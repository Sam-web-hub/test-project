import { Suspense } from "react";
import { BulkBar } from "@/components/bulk-bar";
import { SelectionProvider } from "@/components/selection";
import { TableSkeleton } from "@/components/table-skeleton";
import { TodoForm } from "@/components/todo-form";
import { TodoTable } from "@/components/todo-table";

/**
 * Server Component.
 * Styled with Tailwind CSS matching design/screen.png:
 * Top header with Todos and the glowing violet dot, always-visible add form card,
 * and adaptive bulk bar wrapping the table.
 */
export default function Page() {
    return (
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen" data-purpose="todo-application">
            <header className="flex items-center justify-between mb-5" data-purpose="header-section">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-semibold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <span>Todos</span>
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-linear-to-tr from-indigo-500 to-violet-500 shadow-sm shadow-indigo-300" aria-hidden="true" />
                    </h1>
                </div>
            </header>

            <SelectionProvider>
                <div className="sticky top-0 z-10 bg-[#fafafa]/95 backdrop-blur-xs pt-1 pb-1">
                    <section
                        className="bg-white border border-slate-200 rounded-xl shadow-sm mb-5 overflow-hidden"
                        data-purpose="todo-controls-section"
                        aria-label="Todo form and bulk actions"
                    >
                        <TodoForm />
                        <BulkBar />
                    </section>
                </div>

                <Suspense fallback={<TableSkeleton />}>
                    <TodoTable />
                </Suspense>
            </SelectionProvider>
        </main>
    );
}
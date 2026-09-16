import { Suspense } from "react";
import { BulkBar } from "@/components/bulk-bar";
import { SelectionProvider } from "@/components/selection";
import { TableSkeleton } from "@/components/table-skeleton";
import { TodoForm } from "@/components/todo-form";
import { TodoTable } from "@/components/todo-table";

/**
 * Server Component. The title scrolls away with the page; the add-form and
 * bulk bar are hoisted into one sticky wrapper below it so they're pinned
 * together regardless of how far down the table you've scrolled.
 *
 * BulkBar reads everything from SelectionProvider's context, not from props,
 * so lifting it out of TodoTable and next to TodoForm is a pure move — it
 * just needs SelectionProvider to wrap this whole region now, not only the
 * table.
 */
export default function Page() {
  return (
    <main className="page">
      <header className="masthead sticky-toolbar">
        <h1>Todos</h1>
      </header>

      <SelectionProvider>
        <div className="sticky-toolbar">
          <TodoForm />
          <BulkBar />
        </div>

        <Suspense fallback={<TableSkeleton />}>
          <TodoTable />
        </Suspense>
      </SelectionProvider>
    </main>
  );
}
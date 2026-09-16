"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCheckIcon, Trash2Icon, Undo2Icon } from "lucide-react";
import { toast } from "sonner";
import { bulkAction } from "@/app/actions";
import { useSelection } from "./selection";
import type { BulkKind } from "@/lib/types";

/**
 * Always mounted (see page.tsx / sticky-toolbar) — never returns null. With
 * nothing selected the count reads "0 selected" and every action is
 * disabled, rather than the bar disappearing and reappearing as the person
 * checks rows.
 */
export function BulkBar() {
    const { selected, clear, setPhase, busy, setBusy, allSelectedCompleted } =
        useSelection();
    const [, startTransition] = useTransition();
    const router = useRouter();

    const empty = selected.length === 0;

    // Adaptive: if everything currently selected is already done, the useful
    // action is reopening them; otherwise (open, or a mix) it's marking done.
    const markKind: BulkKind = allSelectedCompleted ? "incomplete" : "complete";
    const markLabel = allSelectedCompleted ? "Mark open" : "Mark done";
    const MarkIcon = allSelectedCompleted ? Undo2Icon : CheckCheckIcon;

    async function run(kind: BulkKind) {
        const ids = [...selected];
        if (ids.length === 0) return;

        setBusy(true);
        for (const id of ids) setPhase(id, "working");

        const failures: number[] = [];

        try {
            // Next turns the async generator Server Action into a stream; this is
            // the whole client-side reader. No ReadableStream, no NDJSON parsing.
            const stream = await bulkAction(ids, kind);

            for await (const update of stream) {
                if (update.status === "success") {
                    setPhase(update.id, "done");
                } else {
                    failures.push(update.id);
                    setPhase(update.id, "failed");
                }
            }
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "The bulk action stopped early.",
            );
            setBusy(false);
            return;
        }

        const succeeded = ids.length - failures.length;
        const verb =
            kind === "delete" ? "deleted" : kind === "incomplete" ? "reopened" : "completed";

        if (failures.length === 0) {
            toast.success(`${succeeded} ${succeeded === 1 ? "todo" : "todos"} ${verb}`);
        } else {
            toast.warning(
                `${succeeded} ${verb}, ${failures.length} failed (#${failures.join(", #")})`,
            );
        }

        setBusy(false);
        startTransition(() => {
            clear();
            // revalidatePath fires after the stream closes, so refresh explicitly to
            // pull the re-rendered Server Component tree.
            router.refresh();
        });
    }

    return (
        <div className="bulk-bar" role="region" aria-label="Bulk actions">
            <p className="bulk-count">{selected.length} selected</p>
            <div className="bulk-actions">
                <button
                    type="button"
                    className="button ghost"
                    onClick={() => run(markKind)}
                    disabled={empty || busy}
                >
                    <MarkIcon aria-hidden />
                    {markLabel}
                </button>
                <button
                    type="button"
                    className="button ghost danger"
                    onClick={() => run("delete")}
                    disabled={empty || busy}
                >
                    <Trash2Icon aria-hidden />
                    Delete
                </button>
                <button
                    type="button"
                    className="button quiet"
                    onClick={clear}
                    disabled={empty || busy}
                >
                    Clear selection
                </button>
            </div>
        </div>
    );
}
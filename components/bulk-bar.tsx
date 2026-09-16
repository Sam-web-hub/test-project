"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCheckIcon, Trash2Icon, Undo2Icon } from "lucide-react";
import { toast } from "sonner";
import { bulkAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSelection } from "./selection";
import type { BulkKind } from "@/lib/types";

/**
 * Always mounted (see page.tsx) — never returns null.
 * When nothing is selected, the count reads "0 selected" and actions are disabled.
 * Uses a single adaptive toggle button with terminology matching the design:
 * "Mark Complete" / "Mark Incomplete".
 */
export function BulkBar() {
    const { selected, clear, setPhase, busy, setBusy, allSelectedCompleted } =
        useSelection();
    const [, startTransition] = useTransition();
    const router = useRouter();

    const empty = selected.length === 0;

    // Adaptive single button:
    // If everything selected is already done, action is "Mark Incomplete"; otherwise "Mark Complete".
    const markKind: BulkKind = allSelectedCompleted ? "incomplete" : "complete";
    const markLabel = allSelectedCompleted ? "Mark Incomplete" : "Mark Complete";
    const markVariant = allSelectedCompleted ? "amber" : "emerald";
    const MarkIcon = allSelectedCompleted ? Undo2Icon : CheckCheckIcon;

    async function run(kind: BulkKind) {
        const ids = [...selected];
        if (ids.length === 0) return;

        setBusy(true);
        for (const id of ids) setPhase(id, "working");

        const failures: number[] = [];

        try {
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
            kind === "delete" ? "deleted" : kind === "incomplete" ? "marked incomplete" : "completed";

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
            router.refresh();
        });
    }

    return (
        <div
            className="border-t border-slate-100 bg-slate-50/50 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 transition-colors duration-200"
            role="region"
            aria-label="Bulk actions"
            data-purpose="bulk-action-bar"
        >
            <div className="flex items-center gap-2">
                <Badge variant="selected">
                    {selected.length} selected
                </Badge>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <Button
                    type="button"
                    variant={markVariant}
                    size="sm"
                    onClick={() => run(markKind)}
                    disabled={empty || busy}
                    className="gap-1.5 text-xs font-medium"
                >
                    <MarkIcon className="size-3.5" aria-hidden />
                    <span>{markLabel}</span>
                </Button>

                <Button
                    type="button"
                    variant="rose"
                    size="sm"
                    onClick={() => run("delete")}
                    disabled={empty || busy}
                    className="gap-1.5 text-xs font-medium"
                >
                    <Trash2Icon className="size-3.5" aria-hidden />
                    <span>Delete Selected</span>
                </Button>

                <Button
                    type="button"
                    variant="muted"
                    size="sm"
                    onClick={clear}
                    disabled={empty || busy}
                    className="text-xs font-medium"
                >
                    Clear selection
                </Button>
            </div>
        </div>
    );
}
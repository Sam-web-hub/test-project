"use client";

import { useOptimistic, useTransition } from "react";
import { LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import { setCompleted } from "@/app/actions";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "cn";
import { useOptionalSelection } from "./selection";

/**
 * Universal status toggle pill.
 * Renders as an interactive Shadcn Badge using CVA variants 'completed' (emerald) and 'pending' (amber).
 * Uses useOptimistic for immediate state feedback before the server action settles.
 */
export function StatusToggle({
    id,
    completed,
    label,
}: {
    id: number;
    completed: boolean;
    label: string;
}) {
    const [optimistic, setOptimistic] = useOptimistic(completed);
    const [isPending, startTransition] = useTransition();
    const selection = useOptionalSelection();
    const busy = selection?.busy ?? false;

    function onToggle() {
        startTransition(async () => {
            setOptimistic(!completed);
            try {
                await setCompleted(id, !completed);
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : "Could not update that todo.",
                );
            }
        });
    }

    const variant = optimistic ? "completed" : "pending";
    const statusText = optimistic ? "Completed" : "Pending";
    const nextText = optimistic ? "pending" : "completed";

    return (
        <button
            type="button"
            onClick={onToggle}
            disabled={isPending || busy}
            className={cn(
                badgeVariants({ variant }),
                "cursor-pointer active:scale-95 disabled:pointer-events-none disabled:opacity-50 select-none",
            )}
            aria-pressed={optimistic}
            aria-label={`Mark "${label}" as ${nextText}`}
            title={`Click to mark ${nextText}`}
        >
            {isPending ? <LoaderIcon className="size-3 animate-spin" aria-hidden /> : null}
            <span>{statusText}</span>
        </button>
    );
}

// Backwards compatibility alias
export { StatusToggle as RowStatus };

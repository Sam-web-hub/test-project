"use client";

import { useOptimistic, useTransition } from "react";
import { LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import { setCompleted } from "@/app/actions";
import { useSelection } from "./selection";

/**
 * Replaces the old click-to-toggle <span>: a real button, so it is focusable
 * and keyboard-operable. useOptimistic replaces the per-row `loading` flag
 * that used to be threaded down from TodoList.
 */
export function RowStatus({
    id,
    completed,
    label,
}: {
    id: number;
    completed: boolean;
    label: string;
}) {
    const [optimistic, setOptimistic] = useOptimistic(completed);
    const [pending, startTransition] = useTransition();
    const { busy } = useSelection();

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

    return (
        <button
            type="button"
            onClick={onToggle}
            disabled={pending || busy}
            className="status"
            data-done={optimistic || undefined}
            aria-pressed={optimistic}
            aria-label={`Mark "${label}" as ${optimistic ? "open" : "done"}`}
        >
            {pending ? <LoaderIcon className="spin" aria-hidden /> : null}
            {optimistic ? "Done" : "Open"}
        </button>
    );
}

"use client";

import { useOptimistic, useTransition } from "react";
import { LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import { setCompleted } from "@/app/actions";
import { useOptionalSelection } from "./selection";

/**
 * Universal status toggle button.
 * Works in table rows (respecting selection busy state) and on detail cards.
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
    const [pending, startTransition] = useTransition();
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

// Backwards compatibility alias
export { StatusToggle as RowStatus };

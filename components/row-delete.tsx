"use client";

import { useTransition } from "react";
import { LoaderIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { deleteTodo } from "@/app/actions";
import { useSelection } from "./selection";

export function RowDelete({ id, label }: { id: number; label: string }) {
    const [pending, startTransition] = useTransition();
    const { setPhase, busy } = useSelection();

    function onDelete() {
        startTransition(async () => {
            setPhase(id, "working");
            try {
                await deleteTodo(id);
                toast.success("Todo deleted");
            } catch (error) {
                setPhase(id, "failed");
                toast.error(
                    error instanceof Error ? error.message : "Could not delete that todo.",
                );
            }
        });
    }

    return (
        <button
            type="button"
            className="icon-button danger"
            onClick={onDelete}
            disabled={pending || busy}
            aria-label={`Delete "${label}"`}
        >
            {pending ? <LoaderIcon className="spin" aria-hidden /> : <Trash2Icon aria-hidden />}
        </button>
    );
}

"use client";

import { useTransition } from "react";
import { LoaderIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { deleteTodo } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { useSelection } from "./selection";

export function RowDelete({ id, label }: { id: number; label: string }) {
    const [pending, startTransition] = useTransition();
    const { setPhase, deselect, busy } = useSelection();

    function onDelete() {
        startTransition(async () => {
            setPhase(id, "working");
            try {
                await deleteTodo(id);
                deselect(id);
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
        <Button
            type="button"
            variant="rowIconDanger"
            size="icon-sm"
            onClick={onDelete}
            disabled={pending || busy}
            aria-label={`Delete "${label}"`}
            title="Delete task"
        >
            {pending ? (
                <LoaderIcon className="size-4 animate-spin" aria-hidden />
            ) : (
                <Trash2Icon className="size-4" aria-hidden />
            )}
        </Button>
    );
}

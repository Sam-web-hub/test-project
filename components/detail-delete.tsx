"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { deleteTodo } from "@/app/actions";
import { Button } from "@/components/ui/button";

/**
 * Client leaf component. Provides frictionless deletion with loading state
 * and redirection back to the main list.
 */
export function DetailDelete({ id, label }: { id: number; label: string }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    function onDelete() {
        startTransition(async () => {
            try {
                await deleteTodo(id);
                toast.success("Todo deleted");
                router.push("/");
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : "Could not delete that todo.",
                );
            }
        });
    }

    return (
        <Button
            type="button"
            variant="rose"
            size="sm"
            onClick={onDelete}
            disabled={pending}
            className="gap-1.5 text-xs font-medium"
            aria-label={`Delete "${label}"`}
            title="Delete task"
        >
            {pending ? (
                <LoaderIcon className="size-3.5 animate-spin" aria-hidden />
            ) : (
                <Trash2Icon className="size-3.5" aria-hidden />
            )}
            <span>Delete</span>
        </Button>
    );
}

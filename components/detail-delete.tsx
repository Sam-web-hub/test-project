"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { deleteTodo } from "@/app/actions";

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
        <button
            type="button"
            className="button ghost danger"
            onClick={onDelete}
            disabled={pending}
            aria-label={`Delete "${label}"`}
        >
            {pending ? <LoaderIcon className="spin" aria-hidden /> : <Trash2Icon aria-hidden />}
            Delete
        </button>
    );
}

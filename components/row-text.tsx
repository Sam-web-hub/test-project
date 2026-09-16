"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckIcon, LoaderIcon, PencilIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { MAX_TODO_LENGTH } from "@/lib/constants";
import { renameTodo } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";
import { useSelection } from "./selection";
import type { ActionState } from "@/lib/types";

const initial: ActionState = { ok: true };

export function RowText({
    id,
    text,
    completed,
}: {
    id: number;
    text: string;
    completed: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [state, formAction, pending] = useActionState(renameTodo, initial);
    const inputRef = useRef<HTMLInputElement>(null);
    const { busy } = useSelection();

    const [prevNonce, setPrevNonce] = useState(state.nonce);

    if (state.nonce !== prevNonce) {
        setPrevNonce(state.nonce);
        if (state.ok) {
            setEditing(false);
        }
    }

    useEffect(() => {
        if (state.ok && state.nonce) {
            toast.success("Todo updated");
        }
    }, [state.nonce, state.ok]);

    useEffect(() => {
        if (editing) inputRef.current?.select();
    }, [editing]);

    if (!editing) {
        return (
            <div className="flex items-center gap-2 group">
                <Link
                    href={`/todos/${id}`}
                    className={cn(
                        "text-[13.5px] leading-snug select-none transition-colors max-w-[20rem] sm:max-w-md truncate block",
                        completed
                            ? "line-through text-slate-400 font-normal"
                            : "text-slate-800 font-normal hover:text-slate-950",
                    )}
                    title={text}
                >
                    {text}
                </Link>
                <Button
                    type="button"
                    variant="rowIcon"
                    size="icon-sm"
                    className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={() => setEditing(true)}
                    disabled={busy}
                    aria-label={`Edit "${text}"`}
                    title="Edit task"
                >
                    <PencilIcon className="size-3.5" aria-hidden />
                </Button>
            </div>
        );
    }

    return (
        <form action={formAction} className="flex items-center gap-1.5 w-full">
            <input type="hidden" name="id" value={id} />
            <Input
                ref={inputRef}
                name="todo"
                defaultValue={text}
                maxLength={MAX_TODO_LENGTH}
                disabled={pending}
                className="h-8 text-sm px-2.5 py-1 border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                aria-invalid={state.ok ? undefined : true}
                aria-label="Todo text"
                onKeyDown={(e) => {
                    if (e.key === "Escape") setEditing(false);
                }}
            />
            <Button
                type="submit"
                variant="rowIcon"
                size="icon-sm"
                disabled={pending}
                aria-label="Save changes"
            >
                {pending ? (
                    <LoaderIcon className="size-3.5 animate-spin" aria-hidden />
                ) : (
                    <CheckIcon className="size-3.5 text-emerald-600" aria-hidden />
                )}
            </Button>
            <Button
                type="button"
                variant="rowIcon"
                size="icon-sm"
                onClick={() => setEditing(false)}
                disabled={pending}
                aria-label="Cancel editing"
            >
                <XIcon className="size-3.5" aria-hidden />
            </Button>
            {state.error ? (
                <p className="text-xs text-rose-600 ml-2" role="alert">
                    {state.error}
                </p>
            ) : null}
        </form>
    );
}

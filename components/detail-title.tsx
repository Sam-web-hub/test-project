"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CheckIcon, LoaderIcon, PencilIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { MAX_TODO_LENGTH } from "@/lib/constants";
import { renameTodo } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";
import type { ActionState } from "@/lib/types";

const initial: ActionState = { ok: true };

/**
 * Client leaf component. Only handles title display and inline editing
 * on the detail page, keeping the surrounding card chrome server-rendered.
 */
export function DetailTitle({
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
        if (editing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [editing]);

    if (!editing) {
        return (
            <div className="flex items-start justify-between gap-4">
                <h1
                    className={cn(
                        "text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight break-words",
                        completed && "line-through text-slate-400",
                    )}
                >
                    {text}
                </h1>
                <Button
                    type="button"
                    variant="rowIcon"
                    size="icon-sm"
                    onClick={() => setEditing(true)}
                    aria-label={`Edit "${text}"`}
                    title="Edit task title"
                >
                    <PencilIcon className="size-4" aria-hidden />
                </Button>
            </div>
        );
    }

    return (
        <form action={formAction} className="flex flex-col gap-3">
            <input type="hidden" name="id" value={id} />
            <Input
                ref={inputRef}
                name="todo"
                defaultValue={text}
                maxLength={MAX_TODO_LENGTH}
                disabled={pending}
                className="w-full text-base border-slate-200 rounded-lg px-3.5 py-2 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                aria-invalid={state.ok ? undefined : true}
                aria-label="Todo text"
                onKeyDown={(e) => {
                    if (e.key === "Escape") setEditing(false);
                }}
            />
            <div className="flex items-center gap-2">
                <Button type="submit" variant="gradient" size="sm" disabled={pending} className="gap-1.5">
                    {pending ? <LoaderIcon className="size-3.5 animate-spin" aria-hidden /> : <CheckIcon className="size-3.5" aria-hidden />}
                    <span>Save</span>
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(false)}
                    disabled={pending}
                    className="text-slate-500 hover:text-slate-800"
                >
                    <XIcon className="size-3.5 mr-1" aria-hidden />
                    <span>Cancel</span>
                </Button>
            </div>
            {state.error ? (
                <p className="text-xs text-rose-600" role="alert">
                    {state.error}
                </p>
            ) : null}
        </form>
    );
}

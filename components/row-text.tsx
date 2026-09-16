"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CheckIcon, LoaderIcon, PencilIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { MAX_TODO_LENGTH } from "@/lib/constants";
import { renameTodo } from "@/app/actions";
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

    useEffect(() => {
        if (state.ok && state.nonce) {
            setEditing(false);
            toast.success("Todo updated");
        }
    }, [state]);

    useEffect(() => {
        if (editing) inputRef.current?.select();
    }, [editing]);

    if (!editing) {
        return (
            <div className="text-cell">
                <span className="text" data-done={completed || undefined} title={text}>
                    {text}
                </span>
                <button
                    type="button"
                    className="icon-button"
                    onClick={() => setEditing(true)}
                    disabled={busy}
                    aria-label={`Edit "${text}"`}
                >
                    <PencilIcon aria-hidden />
                </button>
            </div>
        );
    }

    return (
        <form action={formAction} className="text-cell">
            <input type="hidden" name="id" value={id} />
            <input
                ref={inputRef}
                name="todo"
                defaultValue={text}
                maxLength={MAX_TODO_LENGTH}
                disabled={pending}
                className="input"
                aria-invalid={state.ok ? undefined : true}
                aria-label="Todo text"
                onKeyDown={(e) => {
                    if (e.key === "Escape") setEditing(false);
                }}
            />
            <button type="submit" className="icon-button" disabled={pending} aria-label="Save changes">
                {pending ? <LoaderIcon className="spin" aria-hidden /> : <CheckIcon aria-hidden />}
            </button>
            <button
                type="button"
                className="icon-button"
                onClick={() => setEditing(false)}
                disabled={pending}
                aria-label="Cancel editing"
            >
                <XIcon aria-hidden />
            </button>
            {state.error ? <p className="field-error">{state.error}</p> : null}
        </form>
    );
}

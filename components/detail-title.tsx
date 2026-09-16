"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CheckIcon, LoaderIcon, PencilIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { MAX_TODO_LENGTH } from "@/lib/constants";
import { renameTodo } from "@/app/actions";
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
            <div className="detail-title-row">
                <h1 className="detail-title" data-done={completed || undefined}>
                    {text}
                </h1>
                <button
                    type="button"
                    className="icon-button"
                    onClick={() => setEditing(true)}
                    aria-label={`Edit "${text}"`}
                >
                    <PencilIcon aria-hidden />
                </button>
            </div>
        );
    }

    return (
        <form action={formAction} className="detail-edit-form">
            <input type="hidden" name="id" value={id} />
            <input
                ref={inputRef}
                name="todo"
                defaultValue={text}
                maxLength={MAX_TODO_LENGTH}
                disabled={pending}
                className="input input-lg"
                aria-invalid={state.ok ? undefined : true}
                aria-label="Todo text"
                onKeyDown={(e) => {
                    if (e.key === "Escape") setEditing(false);
                }}
            />
            <div className="detail-edit-actions">
                <button type="submit" className="button" disabled={pending}>
                    {pending ? <LoaderIcon className="spin" aria-hidden /> : <CheckIcon aria-hidden />}
                    Save
                </button>
                <button
                    type="button"
                    className="button ghost"
                    onClick={() => setEditing(false)}
                    disabled={pending}
                >
                    <XIcon aria-hidden />
                    Cancel
                </button>
            </div>
            {state.error ? (
                <p className="field-error" role="alert">
                    {state.error}
                </p>
            ) : null}
        </form>
    );
}

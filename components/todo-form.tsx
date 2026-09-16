"use client";

import { useActionState, useEffect, useRef } from "react";
import { LoaderIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { MAX_TODO_LENGTH } from "@/lib/constants";
import { createTodo } from "@/app/actions";
import type { ActionState } from "@/lib/types";

const initial: ActionState = { ok: true };

export function TodoForm() {
    const [state, formAction, pending] = useActionState(createTodo, initial);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.ok && state.nonce) {
            formRef.current?.reset();
            toast.success("Todo added");
        }
    }, [state]);

    return (
        <form ref={formRef} action={formAction} className="add-form">
            <input
                name="todo"
                placeholder="What needs doing?"
                maxLength={MAX_TODO_LENGTH}
                disabled={pending}
                className="input input-lg"
                aria-invalid={state.ok ? undefined : true}
                aria-label="New todo"
            />
            <button type="submit" className="button" disabled={pending}>
                {pending ? <LoaderIcon className="spin" aria-hidden /> : <PlusIcon aria-hidden />}
                Add todo
            </button>
            {state.error ? (
                <p className="field-error" role="alert">
                    {state.error}
                </p>
            ) : null}
        </form>
    );
}

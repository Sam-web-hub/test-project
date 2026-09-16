"use client";

import { useActionState, useEffect, useRef } from "react";
import { LoaderIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { MAX_TODO_LENGTH } from "@/lib/constants";
import { createTodo } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        <div className="p-3 sm:p-3.5">
            <form ref={formRef} action={formAction} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full">
                    <Input
                        name="todo"
                        placeholder="What needs to be done?"
                        maxLength={MAX_TODO_LENGTH}
                        disabled={pending}
                        className="w-full text-sm border-slate-200 rounded-lg px-3.5 py-2 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 placeholder:text-slate-400"
                        aria-invalid={state.ok ? undefined : true}
                        aria-label="New todo"
                    />
                    {state.error ? (
                        <p className="text-xs text-rose-600 mt-1 pl-1" role="alert">
                            {state.error}
                        </p>
                    ) : null}
                </div>
                <Button
                    type="submit"
                    variant="gradient"
                    disabled={pending}
                    className="w-full sm:w-auto shrink-0 gap-1.5 px-4 py-2 text-sm font-medium"
                >
                    {pending ? (
                        <LoaderIcon className="size-4 animate-spin" aria-hidden />
                    ) : (
                        <PlusIcon className="size-4" aria-hidden />
                    )}
                    <span>Add Todo</span>
                </Button>
            </form>
        </div>
    );
}

"use server";

import { revalidatePath } from "next/cache";
import { BULK_PACE_MS, MAX_TODO_LENGTH } from "@/lib/constants";
import { sleep } from "@/lib/sleep";
import { bulkMutateTodos, insertTodo, patchTodo, removeTodo } from "@/lib/store";
import type { ActionState, BulkKind, BulkUpdate } from "@/lib/types";

/** Validation lives here, on the server, once — not duplicated per input. */
function readText(value: FormDataEntryValue | null): string | { error: string } {
    const text = typeof value === "string" ? value.trim() : "";
    if (!text) return { error: "Write something first." };
    if (text.length > MAX_TODO_LENGTH) {
        return { error: `Keep it under ${MAX_TODO_LENGTH} characters.` };
    }
    return text;
}

export async function createTodo(
    _prev: ActionState,
    formData: FormData,
): Promise<ActionState> {
    const text = readText(formData.get("todo"));
    if (typeof text !== "string") return { ok: false, error: text.error };

    try {
        await insertTodo(text);
        revalidatePath("/");
        return { ok: true, nonce: Date.now() };
    } catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : "Failed to save todo.",
        };
    }
}

export async function renameTodo(
    _prev: ActionState,
    formData: FormData,
): Promise<ActionState> {
    const id = Number(formData.get("id"));
    const text = readText(formData.get("todo"));
    if (typeof text !== "string") return { ok: false, error: text.error };

    const updated = await patchTodo(id, { todo: text });
    if (!updated) return { ok: false, error: "That todo no longer exists." };

    revalidatePath("/");
    revalidatePath(`/todos/${id}`);
    return { ok: true, nonce: Date.now() };
}

export async function setCompleted(id: number, completed: boolean) {
    const updated = await patchTodo(id, { completed });
    if (!updated) throw new Error("That todo no longer exists.");
    revalidatePath("/");
    revalidatePath(`/todos/${id}`);
}

export async function deleteTodo(id: number) {
    const removed = await removeTodo(id);
    if (!removed) throw new Error("That todo no longer exists.");
    revalidatePath("/");
    revalidatePath(`/todos/${id}`);
}

/**
 * Bulk action as an async generator Server Action.
 *
 * Commits the batch update to the cookie before streaming begins, ensuring
 * HTTP Set-Cookie headers are sent before response chunks. Then streams
 * the progress updates with pacing to drive the client-side UI animations.
 */
export async function* bulkAction(
    ids: number[],
    kind: BulkKind,
): AsyncGenerator<BulkUpdate> {
    let results: Map<number, boolean>;
    try {
        results = await bulkMutateTodos(ids, kind);
    } catch {
        results = new Map();
    }

    for (const id of ids) {
        await sleep(BULK_PACE_MS);
        const done = results.get(id) ?? false;
        yield done
            ? { id, status: "success" }
            : { id, status: "failed", reason: "No longer exists" };
    }

    revalidatePath("/");
}
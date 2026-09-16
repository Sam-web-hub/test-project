"use server";

import { revalidatePath } from "next/cache";
import { BULK_PACE_MS, MAX_TODO_LENGTH } from "@/lib/constants";
import { sleep } from "@/lib/sleep";
import { insertTodo, patchTodo, removeTodo } from "@/lib/store";
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

    await insertTodo(text);
    revalidatePath("/");
    return { ok: true, nonce: Date.now() };
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
    return { ok: true, nonce: Date.now() };
}

export async function setCompleted(id: number, completed: boolean) {
    const updated = await patchTodo(id, { completed });
    if (!updated) throw new Error("That todo no longer exists.");
    revalidatePath("/");
}

export async function deleteTodo(id: number) {
    const removed = await removeTodo(id);
    if (!removed) throw new Error("That todo no longer exists.");
    revalidatePath("/");
}

/**
 * Bulk action as an async generator Server Action.
 *
 * Next converts this into a stream the client consumes with `for await`.
 * The old NDJSON route handler did the same thing by hand: a ReadableStream,
 * a TextDecoder, manual line-splitting, and a `status` field the client then
 * forgot to read. Here the update is a typed object and failures are
 * structurally impossible to ignore — the client switches on `status`.
 */
export async function* bulkAction(
    ids: number[],
    kind: BulkKind,
): AsyncGenerator<BulkUpdate> {
    for (const id of ids) {
        await sleep(BULK_PACE_MS);
        try {
            const done =
                kind === "delete"
                    ? await removeTodo(id)
                    : Boolean(await patchTodo(id, { completed: kind === "complete" }));

            yield done
                ? { id, status: "success" }
                : { id, status: "failed", reason: "No longer exists" };
        } catch (error) {
            yield {
                id,
                status: "failed",
                reason: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    revalidatePath("/");
}
import "server-only";
import { DUMMYJSON_URL, SEED_DELAY_MS } from "./constants";
import { sleep } from "./sleep";
import type { Todo } from "./types";

/**
 * Single source of truth for the life of the server process.
 *
 * This replaces the old LOCAL_ID_BASE trick. DummyJSON is used exactly once —
 * as seed data — and every mutation after that is real, local and consistent.
 * No id-range branching, no "synthesized response" path, no divergence between
 * what the client thinks exists and what the server will return on refetch.
 *
 * Caveat, stated honestly: module scope dies on cold start and is not shared
 * across serverless instances. Fine for a single dev server; swap the four
 * functions below for SQLite/Prisma when persistence needs to be real.
 */

let todos: Map<number, Todo> | null = null;
let seeding: Promise<Map<number, Todo>> | null = null;
let nextId = 1;

async function seed(): Promise<Map<number, Todo>> {
    const res = await fetch(DUMMYJSON_URL, { cache: "no-store" });
    if (!res.ok) {
        throw new Error(`Could not load todos (DummyJSON returned ${res.status}).`);
    }
    const data = (await res.json()) as { todos: Todo[] };

    if (SEED_DELAY_MS > 0) await sleep(SEED_DELAY_MS);

    const map = new Map<number, Todo>();
    for (const t of data.todos) {
        map.set(t.id, {
            id: t.id,
            todo: t.todo,
            completed: t.completed,
            userId: t.userId,
        });
    }
    nextId = Math.max(0, ...map.keys()) + 1;
    return map;
}

async function db(): Promise<Map<number, Todo>> {
    if (todos) return todos;
    // Deduplicate concurrent first reads so we only seed once.
    seeding ??= seed().then((map) => (todos = map));
    return seeding;
}

export async function listTodos(): Promise<Todo[]> {
    const map = await db();
    return [...map.values()].sort((a, b) => a.id - b.id);
}

export async function getTodo(id: number): Promise<Todo | null> {
    const map = await db();
    return map.get(id) ?? null;
}

export async function insertTodo(text: string): Promise<Todo> {
    const map = await db();
    const todo: Todo = { id: nextId++, todo: text, completed: false, userId: 1 };
    map.set(todo.id, todo);
    return todo;
}

export async function patchTodo(
    id: number,
    patch: Partial<Pick<Todo, "todo" | "completed">>,
): Promise<Todo | null> {
    const map = await db();
    const existing = map.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch };
    map.set(id, updated);
    return updated;
}

export async function removeTodo(id: number): Promise<boolean> {
    const map = await db();
    return map.delete(id);
}

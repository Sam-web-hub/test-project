import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { DUMMYJSON_URL, SEED_DELAY_MS } from "./constants";
import { sleep } from "./sleep";
import type { BulkKind, Todo } from "./types";

const COOKIE_NAME = "todos_data";
const MAX_COOKIE_BYTES = 3800;
const MAX_TODOS_COUNT = 40;

const STATIC_FALLBACK_TODOS: Todo[] = [
    { id: 1, todo: "Do something nice for someone you care about", completed: true, userId: 1 },
    { id: 2, todo: "Memorize the fifty states and their capitals", completed: false, userId: 1 },
    { id: 3, todo: "Watch a classic movie", completed: false, userId: 1 },
    { id: 4, todo: "Contribute code or a bug report to an open-source project", completed: false, userId: 1 },
    { id: 5, todo: "Solve a Rubik's cube", completed: false, userId: 1 },
    { id: 6, todo: "Bake pastries for you and your neighbor", completed: false, userId: 1 },
    { id: 7, todo: "Go see a Broadway production", completed: false, userId: 1 },
    { id: 8, todo: "Write a thank you letter to an influential person in your life", completed: true, userId: 1 },
    { id: 9, todo: "Invite some friends over for a game night", completed: false, userId: 1 },
    { id: 10, todo: "Have a football scrimmage with some friends", completed: false, userId: 1 },
];

async function fetchSeed(): Promise<Todo[]> {
    try {
        const res = await fetch(DUMMYJSON_URL, { cache: "no-store" });
        if (!res.ok) {
            throw new Error(`Could not load todos (DummyJSON returned ${res.status}).`);
        }
        const data = (await res.json()) as { todos: Todo[] };
        if (SEED_DELAY_MS > 0) await sleep(SEED_DELAY_MS);

        return data.todos.map((t) => ({
            id: t.id,
            todo: t.todo,
            completed: Boolean(t.completed),
            userId: t.userId ?? 1,
        }));
    } catch {
        // Safe fallback if DummyJSON is unreachable or throttled
        return STATIC_FALLBACK_TODOS;
    }
}

/**
 * Load todos from the request cookie, falling back to seed data on first visit.
 * Deduplicated per-request via React cache() for fast rendering in Server Components.
 */
const loadTodos = cache(async (): Promise<Todo[]> => {
    const cookieStore = await cookies();
    const raw = cookieStore.get(COOKIE_NAME)?.value;

    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch {
            // Malformed cookie, regenerate from seed
        }
    }

    return fetchSeed();
});

async function saveTodos(todos: Todo[]): Promise<void> {
    const cookieStore = await cookies();
    const serialized = JSON.stringify(todos);

    cookieStore.set(COOKIE_NAME, serialized, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year persistence
    });
}

export async function listTodos(): Promise<Todo[]> {
    const todos = await loadTodos();
    return [...todos].sort((a, b) => a.id - b.id);
}

export async function getTodo(id: number): Promise<Todo | null> {
    const todos = await loadTodos();
    return todos.find((t) => t.id === id) ?? null;
}

export async function insertTodo(text: string): Promise<Todo> {
    const todos = await loadTodos();

    if (todos.length >= MAX_TODOS_COUNT) {
        throw new Error(`Storage limit reached (~${MAX_TODOS_COUNT} tasks). Please delete some tasks to add more.`);
    }

    const maxId = todos.reduce((max, t) => Math.max(max, t.id), 0);
    const todo: Todo = {
        id: maxId + 1,
        todo: text,
        completed: false,
        userId: 1,
    };

    const nextTodos = [...todos, todo];
    if (JSON.stringify(nextTodos).length > MAX_COOKIE_BYTES) {
        throw new Error("Cookie storage limit reached. Please delete some tasks before adding new ones.");
    }

    await saveTodos(nextTodos);
    return todo;
}

export async function patchTodo(
    id: number,
    patch: Partial<Pick<Todo, "todo" | "completed">>,
): Promise<Todo | null> {
    const todos = await loadTodos();
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const updated = { ...todos[index], ...patch };
    todos[index] = updated;
    await saveTodos(todos);
    return updated;
}

export async function removeTodo(id: number): Promise<boolean> {
    const todos = await loadTodos();
    const nextTodos = todos.filter((t) => t.id !== id);
    if (nextTodos.length === todos.length) return false;

    await saveTodos(nextTodos);
    return true;
}

/**
 * Perform a batch mutation on multiple todos and commit to cookie in a single transaction.
 * Called before response streaming begins in bulk Server Actions.
 */
export async function bulkMutateTodos(
    ids: number[],
    kind: BulkKind,
): Promise<Map<number, boolean>> {
    const todos = await loadTodos();
    const targetIds = new Set(ids);
    const results = new Map<number, boolean>();

    let nextTodos: Todo[];

    if (kind === "delete") {
        nextTodos = [];
        for (const t of todos) {
            if (targetIds.has(t.id)) {
                results.set(t.id, true);
            } else {
                nextTodos.push(t);
            }
        }
        for (const id of ids) {
            if (!results.has(id)) results.set(id, false);
        }
    } else {
        const completed = kind === "complete";
        nextTodos = todos.map((t) => {
            if (targetIds.has(t.id)) {
                results.set(t.id, true);
                return { ...t, completed };
            }
            return t;
        });
        for (const id of ids) {
            if (!results.has(id)) results.set(id, false);
        }
    }

    await saveTodos(nextTodos);
    return results;
}

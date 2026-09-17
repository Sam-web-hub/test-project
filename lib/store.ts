import "server-only";
import { asc, count, eq } from "drizzle-orm";
import { db, meta, todos, type NewTodoRow } from "./db";
import type { Todo } from "./types";

/**
 * Initial sample tasks seeded once on an empty database.
 * No external API dependencies, zero artificial latency.
 */
const INITIAL_TODOS: Omit<Todo, "id">[] = [
    { todo: "Do something nice for someone you care about", completed: true, userId: 1 },
    { todo: "Memorize the fifty states and their capitals", completed: false, userId: 1 },
    { todo: "Watch a classic movie", completed: false, userId: 1 },
    { todo: "Contribute code or a bug report to an open-source project", completed: false, userId: 1 },
    { todo: "Solve a Rubik's cube", completed: false, userId: 1 },
    { todo: "Bake pastries for you and your neighbor", completed: false, userId: 1 },
    { todo: "Go see a Broadway production", completed: false, userId: 1 },
    { todo: "Write a thank you letter to an influential person in your life", completed: true, userId: 1 },
    { todo: "Invite some friends over for a game night", completed: false, userId: 1 },
    { todo: "Have a football scrimmage with some friends", completed: false, userId: 1 },
];

let seedingPromise: Promise<void> | null = null;

async function ensureSeeded(): Promise<void> {
    try {
        const isSeeded = await db.select().from(meta).where(eq(meta.key, "seeded")).limit(1);
        if (isSeeded.length > 0) return;

        const [{ total }] = await db.select({ total: count() }).from(todos);
        if (Number(total) === 0) {
            await db.insert(todos).values(INITIAL_TODOS);
        }

        await db.insert(meta).values({ key: "seeded", value: "true" }).onConflictDoNothing();
    } catch (err) {
        console.error("Database seed check failed:", err);
    }
}

async function getReadyDb(): Promise<void> {
    if (!seedingPromise) {
        seedingPromise = ensureSeeded().catch((err) => {
            seedingPromise = null;
            throw err;
        });
    }
    await seedingPromise;
}

export async function listTodos(): Promise<Todo[]> {
    await getReadyDb();
    const rows = await db.select().from(todos).orderBy(asc(todos.id));
    return rows.map((r) => ({
        id: r.id,
        todo: r.todo,
        completed: r.completed,
        userId: r.userId,
    }));
}

export async function getTodo(id: number): Promise<Todo | null> {
    await getReadyDb();
    const rows = await db.select().from(todos).where(eq(todos.id, id)).limit(1);
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
        id: r.id,
        todo: r.todo,
        completed: r.completed,
        userId: r.userId,
    };
}

export async function insertTodo(text: string): Promise<Todo> {
    await getReadyDb();
    const [inserted] = await db
        .insert(todos)
        .values({ todo: text, completed: false, userId: 1 })
        .returning();
    return {
        id: inserted.id,
        todo: inserted.todo,
        completed: inserted.completed,
        userId: inserted.userId,
    };
}

export async function patchTodo(
    id: number,
    patch: Partial<Pick<Todo, "todo" | "completed">>,
): Promise<Todo | null> {
    await getReadyDb();
    const updateData: Partial<NewTodoRow> = {};
    if (patch.todo !== undefined) updateData.todo = patch.todo;
    if (patch.completed !== undefined) updateData.completed = patch.completed;

    const [updated] = await db
        .update(todos)
        .set(updateData)
        .where(eq(todos.id, id))
        .returning();

    if (!updated) return null;
    return {
        id: updated.id,
        todo: updated.todo,
        completed: updated.completed,
        userId: updated.userId,
    };
}

export async function removeTodo(id: number): Promise<boolean> {
    await getReadyDb();
    const deleted = await db
        .delete(todos)
        .where(eq(todos.id, id))
        .returning({ id: todos.id });
    return deleted.length > 0;
}

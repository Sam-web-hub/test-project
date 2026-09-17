import "server-only";
import { desc, eq } from "drizzle-orm";
import { db, todos, type NewTodoRow } from "./db";
import type { Todo } from "./types";

async function getReadyDb(): Promise<void> {
    await Promise.resolve();
}

export async function listTodos(): Promise<Todo[]> {
    await getReadyDb();
    const rows = await db.select().from(todos).orderBy(desc(todos.id));
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

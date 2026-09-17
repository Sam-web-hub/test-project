"use server";

import "server-only";

import { count, eq } from "drizzle-orm";
import { db, meta, todos } from "./db";
import type { Todo } from "./types";

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

export async function seedDatabase(): Promise<void> {
  try {
    const isSeeded = await db.select().from(meta).where(eq(meta.key, "seeded")).limit(1);
    if (isSeeded.length > 0) return;

    const [{ total }] = await db.select({ total: count() }).from(todos);
    if (Number(total) === 0) {
      for (const todo of INITIAL_TODOS) {
        await db.insert(todos).values(todo);
      }
    }

    await db.insert(meta).values({ key: "seeded", value: "true" }).onConflictDoNothing();
  } catch (err) {
    console.error("Database seeding failed:", err);
    throw err;
  }
}

export { INITIAL_TODOS };
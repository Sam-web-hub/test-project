import { pgTable, serial, text, boolean, integer } from "drizzle-orm/pg-core";

export const todos = pgTable("todos", {
    id: serial("id").primaryKey(),
    todo: text("todo").notNull(),
    completed: boolean("completed").default(false).notNull(),
    userId: integer("user_id").default(1).notNull(),
});

export const meta = pgTable("meta", {
    key: text("key").primaryKey(),
    value: text("value").notNull(),
});

export type TodoRow = typeof todos.$inferSelect;
export type NewTodoRow = typeof todos.$inferInsert;

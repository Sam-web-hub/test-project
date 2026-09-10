import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TodoList } from "@/components/todo-list";

async function fetchTodos() {
  const res = await fetch("https://dummyjson.com/todos?limit=20", {
    cache: "no-store",
  });
  const data = await res.json();
  return data.todos;
}

function TodoSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export default async function Home() {
  const todos = await fetchTodos();

  return (
    <main className="mx-auto w-full max-w-3xl py-8">
      <Suspense fallback={<TodoSkeleton />}>
        <TodoList initialTodos={todos} />
      </Suspense>
    </main>
  );
}
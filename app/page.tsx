import { TodoList } from "@/components/todo-list";

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8">
      <TodoList />
    </main>
  );
}
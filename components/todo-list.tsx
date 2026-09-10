"use client";

import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { TodoItem } from "@/components/todo-item";
import { TodoForm } from "@/components/todo-form";
import { BulkActionBar } from "@/components/bulk-action-bar";
import { BulkActionRunner } from "@/components/bulk-action-runner";
import type { Todo } from "@/lib/types";

interface TodoListProps {
  initialTodos: Todo[];
}

export function TodoList({ initialTodos }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [leavingIds, setLeavingIds] = useState<Set<number>>(new Set());
  const [bulkAction, setBulkAction] = useState<
    { action: "delete" | "complete" | "incomplete"; ids: number[] } | null
  >(null);

  function handleSelect(id: number, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(new Set(todos.map((t) => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  }

  function handleUpdate(updated: Todo) {
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function handleDelete(id: number) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function handleAdd(todo: Todo) {
    setTodos((prev) => [todo, ...prev]);
  }

  function handleBulkAction(action: "delete" | "complete" | "incomplete") {
    const ids = Array.from(selectedIds);
    setBulkAction({ action, ids });
  }

  function handleBulkProcessed(id: number) {
    if (!bulkAction) return;
    if (bulkAction.action === "delete") {
      setLeavingIds((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setTodos((prev) => prev.filter((t) => t.id !== id));
        setLeavingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 320);
      return;
    }
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed: bulkAction.action === "complete" }
          : t
      )
    );
  }

  function handleBulkComplete() {
    if (!bulkAction) return;
    const { action, ids } = bulkAction;
    if (action === "delete") {
      setSelectedIds(new Set());
      setBulkAction(null);
      setTimeout(() => {
        setTodos((prev) => prev.filter((t) => !ids.includes(t.id)));
        setLeavingIds(new Set());
      }, 450);
      return;
    }
    setSelectedIds(new Set());
    setBulkAction(null);
    setTimeout(() => {
      setTodos((prev) =>
        prev.map((t) =>
          ids.includes(t.id) ? { ...t, completed: action === "complete" } : t
        )
      );
    }, 450);
  }

  const allSelected = todos.length > 0 && selectedIds.size === todos.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Todos</h1>
        <TodoForm onAdd={handleAdd} />
      </div>

      <BulkActionBar
        count={selectedIds.size}
        onBulkAction={handleBulkAction}
      />

      {bulkAction && (
        <BulkActionRunner
          ids={bulkAction.ids}
          action={bulkAction.action}
          onProcessed={handleBulkProcessed}
          onComplete={handleBulkComplete}
        />
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => handleSelectAll(!!checked)}
              />
            </TableHead>
            <TableHead>Todo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              selected={selectedIds.has(todo.id)}
              leaving={leavingIds.has(todo.id)}
              onSelect={handleSelect}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
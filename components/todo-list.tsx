"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { TodoItem } from "@/components/todo-item";
import { TodoForm } from "@/components/todo-form";
import { BulkActionBar } from "@/components/bulk-action-bar";
import { BulkActionRunner } from "@/components/bulk-action-runner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
import type { Todo } from "@/lib/types";

interface TodoListProps {
  initialTodos?: Todo[];
}

export function TodoList({ initialTodos }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos ?? []);
  const [loading, setLoading] = useState(!initialTodos);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [leavingIds, setLeavingIds] = useState<Set<number>>(new Set());
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [bulkAction, setBulkAction] = useState<
    { action: "delete" | "complete" | "incomplete"; ids: number[] } | null
  >(null);

  useEffect(() => {
    if (!initialTodos) {
      fetch("/api/todos")
        .then(async (res) => {
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP error ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setTodos(data);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch todos:", err);
          toast.error("Failed to load todos from server");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [initialTodos]);

  function handleProcessingChange(id: number, isProcessing: boolean) {
    setProcessingIds((prev) => {
      const next = new Set(prev);
      if (isProcessing) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const isProcessing = bulkAction !== null || processingIds.size > 0;

  function handleSelect(id: number, checked: boolean) {
    if (isProcessing) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleSelectAll(checked: boolean) {
    if (isProcessing) return;
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
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <TooltipProvider delay={150}>
      <div className="space-y-4">
        {/* Sticky Header, Bulk Bar & Add Form */}
        <div className="sticky top-0 z-30 bg-[#fafafa]/95 backdrop-blur-md pt-3 pb-2.5 space-y-3" data-purpose="sticky-top-section">
          <header className="flex items-center justify-between" data-purpose="header-section">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-serif-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2.5">
                <span>Todos</span>
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-sm shadow-indigo-300"></span>
              </h1>
            </div>
          </header>

          {/* Bulk Action Bar */}
          <BulkActionBar
            count={selectedIds.size}
            isProcessing={isProcessing}
            onBulkAction={handleBulkAction}
          />

          {/* Add Form */}
          <TodoForm onAdd={handleAdd} disabled={isProcessing} />
        </div>

      {bulkAction && (
        <BulkActionRunner
          ids={bulkAction.ids}
          action={bulkAction.action}
          onProcessed={handleBulkProcessed}
          onComplete={handleBulkComplete}
        />
      )}

      {/* Table Container */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" data-purpose="todo-list-table">
        <div className="overflow-hidden">
          <table className="w-full table-fixed text-left border-collapse" id="todos-table">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-[12px] sm:text-[13px] font-medium text-slate-500">
                <th className="w-10 sm:w-12 px-2 sm:px-4 py-3 text-center" scope="col">
                  <Checkbox
                    checked={allSelected}
                    disabled={isProcessing || loading || todos.length === 0}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    aria-label="Select all todos"
                  />
                </th>
                <th className="py-3 px-2 sm:px-3 font-medium text-slate-700" scope="col">Todo</th>
                <th className="py-3 px-1 sm:px-4 w-24 sm:w-32 font-medium text-slate-700 text-center" scope="col">Status</th>
                <th className="py-3 px-2 sm:px-4 w-18 sm:w-24 font-medium text-slate-700 text-right pr-3 sm:pr-6" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm" id="todos-tbody">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-2 sm:px-4 py-3.5 text-center w-10 sm:w-12">
                      <div className="w-4 h-4 rounded bg-slate-200 mx-auto" />
                    </td>
                    <td className="py-3.5 px-2 sm:px-3">
                      <div className="h-4 bg-slate-200 rounded w-3/4 max-w-sm" />
                    </td>
                    <td className="py-3.5 px-1 sm:px-4 w-24 sm:w-32 text-center">
                      <div className="h-5 bg-slate-200 rounded-full w-16 mx-auto" />
                    </td>
                    <td className="py-3.5 px-2 sm:px-4 w-18 sm:w-24 text-right pr-3 sm:pr-6">
                      <div className="h-4 bg-slate-200 rounded w-10 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : (
                todos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    selected={selectedIds.has(todo.id)}
                    leaving={leavingIds.has(todo.id)}
                    disabled={isProcessing}
                    onSelect={handleSelect}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onProcessingChange={handleProcessingChange}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {!loading && todos.length === 0 && (
          <div className="py-16 text-center" id="empty-state">
            <svg
              className="mx-auto h-10 w-10 text-slate-300 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
            <p className="text-slate-500 text-sm">No tasks in your list yet.</p>
          </div>
        )}
      </section>

      {/* App Footer */}
      <footer className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 px-2 gap-2" data-purpose="app-footer">
        <div id="footer-stats" className="flex items-center gap-1.5">
          <span className="font-medium text-slate-500">
            {loading ? "Loading tasks..." : `${todos.length} tasks total`}
          </span>
          {!loading && (
            <>
              <span className="mx-1 text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {completedCount} completed
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>Click checkbox to select or manage bulk state</span>
        </div>
      </footer>
    </div>
  </TooltipProvider>
  );
}
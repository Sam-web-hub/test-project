"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PencilIcon, TrashIcon, CheckIcon, XIcon, Loader2Icon } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { toast } from "sonner";
import type { Todo } from "@/lib/types";

interface TodoItemProps {
  todo: Todo;
  selected: boolean;
  leaving?: boolean;
  disabled?: boolean;
  onSelect: (id: number, checked: boolean) => void;
  onUpdate: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onProcessingChange?: (id: number, isProcessing: boolean) => void;
}

export function TodoItem({
  todo,
  selected,
  leaving = false,
  disabled = false,
  onSelect,
  onUpdate,
  onDelete,
  onProcessingChange,
}: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.todo);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rowLeaving, setRowLeaving] = useState(false);

  const isLeaving = rowLeaving || leaving;
  const isRowDisabled = loading || deleting || disabled;

  async function handleSave() {
    if (!text.trim() || isRowDisabled) return;
    setLoading(true);
    onProcessingChange?.(todo.id, true);
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todo: text, completed: todo.completed }),
      });
      if (!res.ok) throw new Error("Failed to update todo");
      const updated = await res.json();
      onUpdate(updated);
      setEditing(false);
      toast.success("Task updated");
    } catch {
      toast.error("Failed to update task");
    } finally {
      setLoading(false);
      onProcessingChange?.(todo.id, false);
    }
  }

  async function handleToggleComplete() {
    if (isRowDisabled) return;
    setLoading(true);
    onProcessingChange?.(todo.id, true);
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          todo: todo.todo,
          completed: !todo.completed,
        }),
      });
      if (!res.ok) throw new Error("Failed to update todo");
      onUpdate(await res.json());
      toast.success(todo.completed ? "Marked incomplete" : "Marked complete");
    } catch {
      toast.error("Failed to update todo");
    } finally {
      setLoading(false);
      onProcessingChange?.(todo.id, false);
    }
  }

  async function handleDelete() {
    if (isRowDisabled) return;
    setDeleting(true);
    onProcessingChange?.(todo.id, true);
    try {
      await fetch(`/api/todos/${todo.id}`, { method: "DELETE" });
      setRowLeaving(true);
      setTimeout(() => {
        onDelete(todo.id);
        onProcessingChange?.(todo.id, false);
      }, 320);
    } catch {
      toast.error("Failed to delete task");
      setDeleting(false);
      onProcessingChange?.(todo.id, false);
    }
  }

  return (
    <tr
      className={`row-transition border-b border-slate-100 hover:bg-slate-50/70 ${
        selected ? "bg-slate-50/90" : ""
      }`}
      data-leaving={isLeaving ? "true" : undefined}
    >
      <td className="px-2 sm:px-4 py-3 sm:py-3.5 text-center align-middle w-10 sm:w-12">
        <Checkbox
          checked={selected}
          disabled={isRowDisabled}
          onCheckedChange={(checked) => onSelect(todo.id, !!checked)}
          aria-label={`Select ${todo.todo}`}
        />
      </td>
      <td className="py-3 sm:py-3.5 px-2 sm:px-3 align-middle overflow-hidden">
        {editing ? (
          <div className="flex items-center gap-2 max-w-sm">
            <Input
              value={text}
              maxLength={200}
              disabled={isRowDisabled}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") {
                  setText(todo.todo);
                  setEditing(false);
                }
              }}
              className="h-8 w-full text-[13px] sm:text-[13.5px] border-slate-200 rounded-lg px-2.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 disabled:opacity-60"
              autoFocus
            />
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger
              render={
                <span
                  onClick={isRowDisabled ? undefined : handleToggleComplete}
                  className={`text-[13px] sm:text-[13.5px] leading-snug select-none transition-colors break-words sm:truncate block max-w-full ${
                    isRowDisabled
                      ? "cursor-default"
                      : "cursor-pointer"
                  } ${
                    todo.completed
                      ? "line-through text-slate-400 font-normal"
                      : "text-slate-800 font-normal hover:text-slate-950"
                  }`}
                />
              }
            >
              {todo.todo}
            </TooltipTrigger>
            <TooltipContent side="top" align="start">
              {todo.todo}
            </TooltipContent>
          </Tooltip>
        )}
      </td>
      <td className="py-3 sm:py-3.5 px-1 sm:px-4 align-middle text-center w-24 sm:w-32">
        <Badge
          variant={todo.completed ? "completed" : "incomplete"}
          render={<button type="button" disabled={isRowDisabled} />}
          onClick={handleToggleComplete}
          className={`cursor-pointer transition-all hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed text-[11px] sm:text-xs px-2 sm:px-3 py-0.5 rounded-full whitespace-nowrap inline-flex items-center gap-1 ${
            todo.completed
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
              : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
          }`}
          title={todo.completed ? "Click to mark Incomplete" : "Click to mark Completed"}
        >
          {loading && <Loader2Icon className="w-3 h-3 animate-spin shrink-0" />}
          <span>{todo.completed ? "Completed" : "Incomplete"}</span>
        </Badge>
      </td>
      <td className="py-3 sm:py-3.5 px-2 sm:px-4 align-middle text-right pr-3 sm:pr-6 w-18 sm:w-24">
        <div className="inline-flex items-center justify-end gap-1 sm:gap-1.5 text-slate-400">
          {editing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={isRowDisabled}
                title="Save changes"
                className="p-1 text-emerald-600 hover:text-emerald-700 rounded transition-colors hover:bg-emerald-50 cursor-pointer disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <CheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setText(todo.todo);
                  setEditing(false);
                }}
                disabled={isRowDisabled}
                title="Cancel"
                className="p-1 text-slate-500 hover:text-slate-700 rounded transition-colors hover:bg-slate-100 cursor-pointer disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed"
              >
                <XIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                disabled={isRowDisabled}
                title="Edit task"
                className="p-1 hover:text-indigo-600 rounded transition-colors hover:bg-indigo-50 cursor-pointer disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed"
              >
                <PencilIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isRowDisabled}
                title="Delete task"
                className="p-1 hover:text-rose-600 rounded transition-colors hover:bg-rose-50 cursor-pointer disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <Loader2Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-rose-500" />
                ) : (
                  <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
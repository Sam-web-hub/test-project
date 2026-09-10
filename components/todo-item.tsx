"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PencilIcon, TrashIcon, CheckIcon, XIcon } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { toast } from "sonner";
import type { Todo } from "@/lib/types";

interface TodoItemProps {
  todo: Todo;
  selected: boolean;
  leaving?: boolean;
  onSelect: (id: number, checked: boolean) => void;
  onUpdate: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

export function TodoItem({
  todo,
  selected,
  leaving = false,
  onSelect,
  onUpdate,
  onDelete,
}: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.todo);
  const [loading, setLoading] = useState(false);
  const [rowLeaving, setRowLeaving] = useState(false);

  const isLeaving = rowLeaving || leaving;

  async function handleSave() {
    if (!text.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ todo: text, completed: todo.completed }),
    });
    const updated = await res.json();
    onUpdate(updated);
    setEditing(false);
    setLoading(false);
  }

  async function handleToggleComplete() {
    if (loading) return;
    setLoading(true);
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
      toast.success(todo.completed ? "Marked pending" : "Marked complete");
    } catch {
      toast.error("Failed to update todo");
    }
    setLoading(false);
  }

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/todos/${todo.id}`, { method: "DELETE" });
    setLoading(false);
    setRowLeaving(true);
    setTimeout(() => onDelete(todo.id), 320);
  }

  return (
    <tr
      className={`row-transition hover:bg-slate-50/70 border-b border-slate-100 ${
        selected ? "bg-slate-50/90" : ""
      }`}
      data-leaving={isLeaving ? "true" : undefined}
    >
      <td className="px-2 sm:px-4 py-3 sm:py-3.5 text-center align-middle w-10 sm:w-12">
        <Checkbox
          checked={selected}
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
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") {
                  setText(todo.todo);
                  setEditing(false);
                }
              }}
              className="h-8 w-full text-[13px] sm:text-[13.5px] border-slate-200 rounded-lg px-2.5 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              autoFocus
            />
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger
              render={
                <span
                  onClick={handleToggleComplete}
                  className={`text-[13px] sm:text-[13.5px] leading-snug cursor-pointer select-none transition-colors break-words sm:truncate block max-w-full ${
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
          variant={todo.completed ? "completed" : "pending"}
          render={<button type="button" disabled={loading} />}
          onClick={handleToggleComplete}
          className="cursor-pointer transition-all hover:opacity-90 disabled:opacity-50 text-[11px] sm:text-xs px-2 sm:px-3 py-0.5 rounded-full whitespace-nowrap"
          title={todo.completed ? "Click to mark Pending" : "Click to mark Completed"}
        >
          {todo.completed ? "Completed" : "Pending"}
        </Badge>
      </td>
      <td className="py-3 sm:py-3.5 px-2 sm:px-4 align-middle text-right pr-3 sm:pr-6 w-18 sm:w-24">
        <div className="inline-flex items-center justify-end gap-1 sm:gap-1.5 text-slate-400">
          {editing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                title="Save changes"
                className="p-1 text-emerald-600 hover:text-emerald-700 rounded transition-colors hover:bg-emerald-50 cursor-pointer disabled:opacity-50"
              >
                <CheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setText(todo.todo);
                  setEditing(false);
                }}
                title="Cancel"
                className="p-1 text-slate-500 hover:text-slate-700 rounded transition-colors hover:bg-slate-100 cursor-pointer"
              >
                <XIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                title="Edit task"
                className="p-1 hover:text-indigo-600 rounded transition-colors hover:bg-indigo-50 cursor-pointer"
              >
                <PencilIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                title="Delete task"
                className="p-1 hover:text-rose-600 rounded transition-colors hover:bg-rose-50 cursor-pointer disabled:opacity-50"
              >
                <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
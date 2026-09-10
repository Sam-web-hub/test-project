"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PencilIcon, TrashIcon, CheckIcon, XIcon } from "lucide-react";
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
      className="border-b"
      data-leaving={isLeaving ? "true" : undefined}
    >
      <td className="p-2 align-middle">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(todo.id, !!checked)}
        />
      </td>
      <td className="max-w-md truncate p-2 align-middle">
        {editing ? (
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
            className="h-7 w-full max-w-xs"
            autoFocus
          />
        ) : (
          <span
            title={todo.todo}
            className={
              todo.completed ? "line-through text-muted-foreground" : ""
            }
          >
            {todo.todo}
          </span>
        )}
      </td>
      <td className="p-2 align-middle">
        <Badge
          variant={todo.completed ? "default" : "secondary"}
          render={<button type="button" disabled={loading} />}
          onClick={handleToggleComplete}
          className="cursor-pointer hover:opacity-80 disabled:opacity-50"
          title={todo.completed ? "Mark as pending" : "Mark as complete"}
        >
          {todo.completed ? "Completed" : "Pending"}
        </Badge>
      </td>
      <td className="p-2 align-middle">
        <div className="flex gap-1">
          {editing ? (
            <>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={handleSave}
                disabled={loading}
              >
                <CheckIcon />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={() => {
                  setText(todo.todo);
                  setEditing(false);
                }}
              >
                <XIcon />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={() => setEditing(true)}
              >
                <PencilIcon />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={handleDelete}
                disabled={loading}
              >
                <TrashIcon />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
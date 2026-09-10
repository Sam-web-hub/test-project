"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import type { Todo } from "@/lib/types";

interface TodoFormProps {
  onAdd: (todo: Todo) => void;
  onCancel: () => void;
}

export function TodoForm({ onAdd, onCancel }: TodoFormProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todo: text.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create todo");
      const newTodo = await res.json();
      onAdd(newTodo);
      setText("");
      toast.success("Todo created");
    } catch {
      toast.error("Failed to create todo");
    }
    setLoading(false);
  }

  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm transition-all duration-200 animate-in fade-in-50 slide-in-from-top-2"
      data-purpose="inline-add-form"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-center gap-3 w-full"
      >
        <div className="flex-1 min-w-0 w-full overflow-hidden">
          <input
            ref={inputRef}
            type="text"
            placeholder="What needs to be done?..."
            value={text}
            title={text}
            maxLength={200}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onCancel();
              }
            }}
            className="w-full text-sm border border-slate-200 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 placeholder:text-slate-400 truncate outline-none transition-all"
            required
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-98 text-white text-xs font-medium rounded-lg shadow-sm shadow-indigo-200 whitespace-nowrap transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Saving..." : "Save Todo"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
"use client";

import { useState, useRef } from "react";
import { PlusIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import type { TodoFormProps } from "@/lib/types";

export function TodoForm({ onAdd, disabled = false }: TodoFormProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isBusy = loading || disabled;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || isBusy) return;
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
      className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm transition-all duration-200"
      data-purpose="inline-add-form"
    >
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 sm:gap-3 w-full"
      >
        <div className="flex-1 min-w-0 overflow-hidden relative">
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
                setText("");
              }
            }}
            className="w-full text-sm border border-slate-200 rounded-lg px-3.5 py-2 pr-8 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 placeholder:text-slate-400 truncate outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isBusy}
            required
          />
          {text.length > 0 && !isBusy && (
            <button
              type="button"
              onClick={() => {
                setText("");
                inputRef.current?.focus();
              }}
              title="Clear text (Esc)"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer transition-colors"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center shrink-0">
          <button
            type="submit"
            disabled={isBusy || !text.trim()}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-98 text-white text-xs font-medium rounded-lg shadow-sm shadow-indigo-200 whitespace-nowrap transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none shrink-0"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>{loading ? "Saving..." : "Save Todo"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
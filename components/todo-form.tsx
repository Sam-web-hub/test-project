"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import type { Todo } from "@/lib/types";

interface TodoFormProps {
  onAdd: (todo: Todo) => void;
}

export function TodoForm({ onAdd }: TodoFormProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todo: text }),
      });
      const newTodo = await res.json();
      onAdd(newTodo);
      setText("");
      setOpen(false);
      toast.success("Todo created");
    } catch {
      toast.error("Failed to create todo");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        Add Todo
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Todo</DialogTitle>
            <DialogDescription>What do you need to do?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Todo text..."
              value={text}
              maxLength={200}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
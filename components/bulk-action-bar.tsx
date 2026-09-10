"use client";

import { Button } from "@/components/ui/button";
import { CheckCircleIcon, TrashIcon, Undo2Icon } from "lucide-react";

interface BulkActionBarProps {
  count: number;
  onBulkAction: (action: "delete" | "complete" | "incomplete") => void;
}

export function BulkActionBar({ count, onBulkAction }: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2">
      <span className="text-sm text-muted-foreground">
        {count} selected
      </span>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => onBulkAction("complete")}
      >
        <CheckCircleIcon />
        Mark Complete
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => onBulkAction("incomplete")}
      >
        <Undo2Icon />
        Mark Incomplete
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => onBulkAction("delete")}
      >
        <TrashIcon />
        Delete Selected
      </Button>
    </div>
  );
}
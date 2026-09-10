"use client";

import { useEffect } from "react";

interface BulkActionRunnerProps {
  ids: number[];
  action: "delete" | "complete" | "incomplete";
  onComplete: () => void;
  onProcessed: (id: number) => void;
}

export function BulkActionRunner({
  ids,
  action,
  onComplete,
  onProcessed,
}: BulkActionRunnerProps) {
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/todos/bulk-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids, action }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error("Stream request failed");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            let entry: { id: number };
            try {
              entry = JSON.parse(line) as { id: number };
            } catch {
              continue;
            }
            onProcessed(entry.id);
          }
        }
      } catch {
        // stream aborted or failed; nothing to surface
      } finally {
        if (!cancelled) {
          onComplete();
        }
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
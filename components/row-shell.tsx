"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "cn";
import { useSelection } from "./selection";

/**
 * Wraps a server-rendered <tr>'s cells so bulk progress can restyle the row
 * without turning the row's content into client JS. Also registers this
 * row's completion state into context, so BulkBar's adaptive button knows
 * what's selected without needing its own copy of the todo list.
 */
export function RowShell({
    id,
    completed,
    children,
}: {
    id: number;
    completed: boolean;
    children: ReactNode;
}) {
    const { isSelected, phase, setCompletedFor } = useSelection();
    const state = phase(id);
    const selected = isSelected(id);

    useEffect(() => {
        setCompletedFor(id, completed);
    }, [id, completed, setCompletedFor]);

    return (
        <tr
            data-selected={selected || undefined}
            data-phase={state}
            className={cn(
                "border-b border-slate-100 transition-colors duration-150 ease-in-out",
                selected ? "bg-slate-50/90" : "hover:bg-slate-50/70",
                state === "working" && "bg-amber-50/60 shadow-[inset_3px_0_0_#d97706]",
                state === "done" && "bg-emerald-50/50 opacity-70",
                state === "failed" && "bg-rose-50/60 shadow-[inset_3px_0_0_#e11d48]",
            )}
        >
            {children}
        </tr>
    );
}
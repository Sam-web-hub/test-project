"use client";

import { useEffect, type ReactNode } from "react";
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

    useEffect(() => {
        setCompletedFor(id, completed);
    }, [id, completed, setCompletedFor]);

    return (
        <tr
            data-selected={isSelected(id) || undefined}
            data-phase={state}
            className="row"
        >
            {children}
        </tr>
    );
}
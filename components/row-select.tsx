"use client";

import { useSelection } from "./selection";

export function RowSelect({ id, label }: { id: number; label: string }) {
    const { isSelected, toggle, busy } = useSelection();

    return (
        <input
            type="checkbox"
            className="checkbox"
            checked={isSelected(id)}
            disabled={busy}
            onChange={() => toggle(id)}
            aria-label={`Select "${label}"`}
        />
    );
}

"use client";

import { useEffect, useRef } from "react";
import { useSelection } from "./selection";

export function SelectAll({ ids }: { ids: number[] }) {
    const { selected, toggle, clear, busy } = useSelection();
    const ref = useRef<HTMLInputElement>(null);

    const all = ids.length > 0 && selected.length === ids.length;
    const some = selected.length > 0 && !all;

    useEffect(() => {
        if (ref.current) ref.current.indeterminate = some;
    }, [some]);

    return (
        <input
            ref={ref}
            type="checkbox"
            className="checkbox"
            checked={all}
            disabled={busy || ids.length === 0}
            onChange={() => {
                if (all) {
                    clear();
                    return;
                }
                for (const id of ids) if (!selected.includes(id)) toggle(id);
            }}
            aria-label={all ? "Clear selection" : "Select all todos"}
        />
    );
}

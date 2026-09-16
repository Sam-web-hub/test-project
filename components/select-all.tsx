"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useSelection } from "./selection";

export function SelectAll({ ids }: { ids: number[] }) {
    const { selected, toggle, clear, busy } = useSelection();

    const all = ids.length > 0 && ids.every((id) => selected.includes(id));
    const some = selected.some((id) => ids.includes(id)) && !all;

    function onToggleAll() {
        if (all) {
            clear();
            return;
        }
        for (const id of ids) {
            if (!selected.includes(id)) toggle(id);
        }
    }

    return (
        <Checkbox
            checked={all}
            indeterminate={some}
            disabled={busy || ids.length === 0}
            onCheckedChange={onToggleAll}
            aria-label={all ? "Clear selection" : "Select all todos"}
        />
    );
}

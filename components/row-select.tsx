"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useSelection } from "./selection";

export function RowSelect({ id, label }: { id: number; label: string }) {
    const { isSelected, toggle, busy } = useSelection();

    return (
        <Checkbox
            checked={isSelected(id)}
            disabled={busy}
            onCheckedChange={() => toggle(id)}
            aria-label={`Select "${label}"`}
        />
    );
}

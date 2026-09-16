"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

type RowPhase = "idle" | "working" | "done" | "failed";

type SelectionValue = {
    selected: number[];
    isSelected: (id: number) => boolean;
    toggle: (id: number) => void;
    clear: () => void;
    phase: (id: number) => RowPhase;
    setPhase: (id: number, phase: RowPhase) => void;
    /**
     * Ground-truth completion per row, kept in sync by RowShell from the
     * server-rendered `completed` prop. Lets BulkBar decide "Mark done" vs
     * "Mark open" without holding its own copy of the todo list.
     */
    setCompletedFor: (id: number, completed: boolean) => void;
    /** True only when every currently selected id is marked completed. */
    allSelectedCompleted: boolean;
    /** True while a bulk run is in flight — disables every row control. */
    busy: boolean;
    setBusy: (busy: boolean) => void;
};

const SelectionContext = createContext<SelectionValue | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
    const [selected, setSelected] = useState<number[]>([]);
    const [phases, setPhases] = useState<Record<number, RowPhase>>({});
    const [completedById, setCompletedById] = useState<Record<number, boolean>>({});
    const [busy, setBusy] = useState(false);

    const toggle = useCallback((id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    }, []);

    const clear = useCallback(() => {
        setSelected([]);
        setPhases({});
    }, []);

    const setPhase = useCallback((id: number, phase: RowPhase) => {
        setPhases((prev) => ({ ...prev, [id]: phase }));
    }, []);

    const setCompletedFor = useCallback((id: number, completed: boolean) => {
        setCompletedById((prev) =>
            prev[id] === completed ? prev : { ...prev, [id]: completed },
        );
    }, []);

    const allSelectedCompleted =
        selected.length > 0 && selected.every((id) => completedById[id] === true);

    const value = useMemo<SelectionValue>(
        () => ({
            selected,
            isSelected: (id) => selected.includes(id),
            toggle,
            clear,
            phase: (id) => phases[id] ?? "idle",
            setPhase,
            setCompletedFor,
            allSelectedCompleted,
            busy,
            setBusy,
        }),
        [
            selected,
            phases,
            busy,
            allSelectedCompleted,
            toggle,
            clear,
            setPhase,
            setCompletedFor,
        ],
    );

    return (
        <SelectionContext.Provider value={value}>
            {children}
        </SelectionContext.Provider>
    );
}

export function useSelection() {
    const ctx = useContext(SelectionContext);
    if (!ctx) throw new Error("useSelection must be used inside SelectionProvider");
    return ctx;
}
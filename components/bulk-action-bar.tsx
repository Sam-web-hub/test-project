"use client";

import { CheckCircleIcon, TrashIcon, Undo2Icon, Loader2Icon } from "lucide-react";
import type { BulkActionBarProps } from "@/lib/types";

export function BulkActionBar({
  count,
  isProcessing = false,
  onBulkAction,
}: BulkActionBarProps) {
  const displayCount = isProcessing && count === 0 ? 1 : count;
  const isActive = count > 0 && !isProcessing;

  return (
    <section
      className={`border rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3 transition-all duration-200 overflow-x-auto no-scrollbar ${
        isActive
          ? "border-slate-200/90 bg-white/95 backdrop-blur-sm shadow-sm"
          : isProcessing
          ? "border-indigo-200/80 bg-indigo-50/40 backdrop-blur-sm shadow-xs"
          : "border-slate-200/60 bg-white/60 backdrop-blur-xs shadow-xs"
      }`}
    >
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <span
          className={`text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-md transition-colors duration-150 whitespace-nowrap flex items-center gap-1.5 ${
            isProcessing
              ? "bg-indigo-100/80 text-indigo-800 border border-indigo-300/80"
              : count > 0
              ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
              : "bg-slate-100 text-slate-400 border border-slate-200/70"
          }`}
        >
          {isProcessing && <Loader2Icon className="w-3 h-3 animate-spin text-indigo-600 shrink-0" />}
          <span>
            {displayCount} <span className="hidden sm:inline">selected</span>
            {isProcessing && <span className="hidden sm:inline"> (processing...)</span>}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          disabled={!isActive}
          onClick={() => onBulkAction("complete")}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
        >
          <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span><span className="hidden sm:inline">Mark </span>Complete</span>
        </button>
        <button
          type="button"
          disabled={!isActive}
          onClick={() => onBulkAction("incomplete")}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-all disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
        >
          <Undo2Icon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span><span className="hidden sm:inline">Mark </span>Incomplete</span>
        </button>
        <button
          type="button"
          disabled={!isActive}
          onClick={() => onBulkAction("delete")}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition-all disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
        >
          <TrashIcon className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>Delete<span className="hidden sm:inline"> Selected</span></span>
        </button>
      </div>
    </section>
  );
}
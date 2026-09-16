"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { cn } from "cn"
import { CheckIcon, MinusIcon } from "lucide-react"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group/checkbox peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-slate-300 bg-white transition-all outline-none cursor-pointer hover:border-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-indigo-600 data-checked:bg-indigo-600 data-checked:text-white data-indeterminate:border-indigo-600 data-indeterminate:bg-indigo-600 data-indeterminate:text-white",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon className="group-data-indeterminate/checkbox:hidden" />
        <MinusIcon className="hidden group-data-indeterminate/checkbox:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }

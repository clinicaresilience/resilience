import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-500 transition-all duration-200 outline-none",
        "focus:border-azul-vivido focus:ring-2 focus:ring-azul-vivido/20 focus:bg-white",
        "hover:border-gray-300",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-900",
        "aria-invalid:border-red-500 aria-invalid:ring-red-500/20",
        className
      )}
      {...props}
    />
  );
}

export { Input };

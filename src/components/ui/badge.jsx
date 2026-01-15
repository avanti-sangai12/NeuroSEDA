import React from 'react';
import { cn } from '../../utils/cn';

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-slate-800 text-slate-50 hover:bg-slate-700",
    secondary: "bg-slate-800 text-slate-50 hover:bg-slate-700",
    destructive: "bg-red-500 text-slate-50 hover:bg-red-600",
    outline: "border border-slate-800 text-slate-50",
    success: "bg-green-500 text-white",
    warning: "bg-yellow-500 text-white",
    info: "bg-blue-500 text-white"
  };
  
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };

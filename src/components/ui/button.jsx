import React from 'react';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-slate-800 text-slate-50 hover:bg-slate-700",
    destructive: "bg-red-500 text-slate-50 hover:bg-red-600",
    outline: "border border-slate-800 bg-transparent hover:bg-slate-800 hover:text-slate-50",
    secondary: "bg-slate-800 text-slate-50 hover:bg-slate-700",
    ghost: "hover:bg-slate-800 hover:text-slate-50",
    link: "text-slate-400 underline-offset-4 hover:text-slate-50",
    gradient: "bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:from-cyan-500 hover:to-blue-600"
  };
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10"
  };
  
  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };

import React from 'react';
import { cn } from '../../utils/cn';

const Slider = React.forwardRef(({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
  const handleChange = (e) => {
    const newValue = parseInt(e.target.value);
    onValueChange?.(newValue);
  };

  return (
    <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value || 0}
        onChange={handleChange}
        className="relative h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 outline-none transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        style={{
          background: `linear-gradient(to right, #22d3ee 0%, #22d3ee ${((value || 0) - min) / (max - min) * 100}%, #1e293b ${((value || 0) - min) / (max - min) * 100}%, #1e293b 100%)`
        }}
        {...props}
      />
      <div className="absolute left-0 top-0 h-2 w-2 rounded-full bg-cyan-400 shadow-lg" />
    </div>
  );
});
Slider.displayName = "Slider";

export { Slider };

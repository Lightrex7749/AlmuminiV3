import React from "react";
import { cn } from "@/lib/utils";

export const BackgroundGrid = ({ children, className }) => {
  return (
    <div className={cn("relative w-full h-full", className)}>
      <div className="absolute inset-0 bg-grid-white/[0.02] dark:bg-grid-black/[0.2]" />
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-white dark:bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      {children}
    </div>
  );
};

export const BackgroundGridSmall = ({ children, className }) => {
  return (
    <div className={cn("relative w-full h-full", className)}>
      <div className="absolute inset-0 bg-grid-small-white/[0.2] dark:bg-grid-small-black/[0.2]" />
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-white dark:bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      {children}
    </div>
  );
};

export const BackgroundDots = ({ children, className }) => {
  return (
    <div className={cn("relative w-full h-full", className)}>
      <div className="absolute inset-0 bg-dot-white/[0.2] dark:bg-dot-black/[0.2]" />
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-white dark:bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      {children}
    </div>
  );
};

"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Border Beam - Magic UI Style
 * An animated beam of light traveling along the border
 */
export const BorderBeam = ({
  className,
  size = 200,
  duration = 12,
  delay = 0,
  colorFrom = "#3b82f6",
  colorTo = "#8b5cf6",
  borderWidth = 1.5,
}) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        className
      )}
      style={{ padding: borderWidth }}
    >
      <div className="absolute inset-0 rounded-[inherit] [mask-composite:exclude] [mask:linear-gradient(white,white)_content-box,linear-gradient(white,white)]">
        <motion.div
          className="absolute aspect-square"
          style={{
            width: size,
            background: `linear-gradient(to right, ${colorFrom}, ${colorTo})`,
            filter: "blur(4px)",
          }}
          animate={{
            offsetDistance: ["0%", "100%"],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "linear",
          }}
          initial={{ offsetDistance: "0%" }}
          // Uses offset-path for smooth animation around the border
        />
      </div>
    </div>
  );
};

/**
 * Simple Border Beam - CSS-only version for better performance
 */
export const SimpleBorderBeam = ({ className, children }) => {
  return (
    <div className={cn("relative group", className)}>
      <div className="absolute -inset-[1px] rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 blur transition-opacity duration-500" />
      <div className="relative bg-white rounded-lg">{children}</div>
    </div>
  );
};

/**
 * Glow Border Card - Glowing border effect
 */
export const GlowBorderCard = ({ children, className, glowColor = "blue" }) => {
  const glowStyles = {
    blue: "from-blue-500/50 via-cyan-500/50 to-blue-500/50",
    purple: "from-purple-500/50 via-pink-500/50 to-purple-500/50",
    rainbow: "from-red-500/50 via-yellow-500/50 to-blue-500/50",
  };

  return (
    <div className={cn("relative p-[2px] rounded-xl group", className)}>
      <div
        className={cn(
          "absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500",
          glowStyles[glowColor] || glowStyles.blue
        )}
      />
      <div
        className={cn(
          "absolute inset-0 rounded-xl bg-gradient-to-r",
          glowStyles[glowColor] || glowStyles.blue
        )}
      />
      <div className="relative bg-white rounded-xl p-6">{children}</div>
    </div>
  );
};

/**
 * Moving Border Button - Aceternity UI Style
 */
export const MovingBorderButton = ({
  children,
  className,
  containerClassName,
  borderClassName,
  duration = 2000,
  ...props
}) => {
  return (
    <button
      className={cn(
        "relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50",
        containerClassName
      )}
      {...props}
    >
      <span
        className={cn(
          "absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3b82f6_0%,#8b5cf6_50%,#3b82f6_100%)]",
          borderClassName
        )}
        style={{ animationDuration: `${duration}ms` }}
      />
      <span
        className={cn(
          "inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-2 text-sm font-medium text-white backdrop-blur-3xl",
          className
        )}
      >
        {children}
      </span>
    </button>
  );
};

/**
 * Hover Border Gradient - Aceternity UI Style
 */
export const HoverBorderGradient = ({ children, className, ...props }) => {
  return (
    <button
      className={cn(
        "relative inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 font-medium transition-all duration-300",
        "hover:border-transparent hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white",
        "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-blue-500 before:to-purple-500 before:opacity-0 before:transition-opacity hover:before:opacity-100",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default BorderBeam;

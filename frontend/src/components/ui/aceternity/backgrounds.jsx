"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Grid Background - Aceternity UI Style
 */
export const GridBackground = ({ children, className }) => {
  return (
    <div className={cn("relative w-full bg-white", className)}>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="relative">{children}</div>
    </div>
  );
};

/**
 * Dot Background - Aceternity UI Style
 */
export const DotBackground = ({ children, className }) => {
  return (
    <div className={cn("relative w-full bg-white", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px]" />
      <div className="relative">{children}</div>
    </div>
  );
};

/**
 * Gradient Background - Beautiful mesh gradient
 */
export const GradientBackground = ({ children, className }) => {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Gradient Orbs */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl" />
      <div className="absolute top-20 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl" />
      <div className="relative">{children}</div>
    </div>
  );
};

/**
 * Animated Gradient Background
 */
export const AnimatedGradient = ({ children, className }) => {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(-45deg, #3b82f6, #8b5cf6, #ec4899, #06b6d4)",
          backgroundSize: "400% 400%",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 15,
          ease: "linear",
          repeat: Infinity,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
};

/**
 * Hero Gradient - Perfect for hero sections
 */
export const HeroGradient = ({ children, className }) => {
  return (
    <div className={cn("relative min-h-screen", className)}>
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-purple-50" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-[100px]" />
      
      <div className="relative">{children}</div>
    </div>
  );
};

/**
 * Noise Overlay - Subtle texture
 */
export const NoiseOverlay = ({ className, opacity = 0.03 }) => {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
};

/**
 * Radial Gradient - Center spotlight effect
 */
export const RadialGradient = ({ children, className, color = "blue" }) => {
  const colors = {
    blue: "from-blue-500/20",
    purple: "from-purple-500/20",
    cyan: "from-cyan-500/20",
    pink: "from-pink-500/20",
  };

  return (
    <div className={cn("relative", className)}>
      <div className={cn("absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] to-transparent", colors[color] || colors.blue)} />
      <div className="relative">{children}</div>
    </div>
  );
};

/**
 * Wavy Divider - Wave shape divider
 */
export const WavyDivider = ({ className, flip = false }) => {
  return (
    <svg
      className={cn("w-full h-24", flip && "rotate-180", className)}
      viewBox="0 0 1440 100"
      preserveAspectRatio="none"
    >
      <path
        fill="currentColor"
        d="M0,50 C150,100 350,0 500,50 C650,100 850,0 1000,50 C1150,100 1350,0 1440,50 L1440,100 L0,100 Z"
      />
    </svg>
  );
};

export default GridBackground;

"use client";
import React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Magnetic Button - Button that follows cursor
 */
export const MagneticButton = ({
  children,
  className,
  strength = 0.3,
  ...props
}) => {
  const ref = React.useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 350, damping: 25 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: xSpring, y: ySpring }}
      className={cn(
        "relative inline-flex items-center justify-center px-6 py-3 font-medium",
        "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full",
        "hover:from-blue-700 hover:to-purple-700 transition-all",
        "shadow-lg hover:shadow-xl",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

/**
 * Shine Button - Button with shine effect on hover
 */
export const ShineButton = ({
  children,
  className,
  ...props
}) => {
  return (
    <motion.button
      className={cn(
        "relative overflow-hidden inline-flex items-center justify-center",
        "px-6 py-3 font-medium bg-slate-900 text-white rounded-full",
        "group",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </motion.button>
  );
};

/**
 * Ripple Button - Button with ripple effect on click
 */
export const RippleButton = ({
  children,
  className,
  ...props
}) => {
  const [ripples, setRipples] = React.useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples([...ripples, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        "relative overflow-hidden inline-flex items-center justify-center",
        "px-6 py-3 font-medium bg-blue-600 text-white rounded-lg",
        "hover:bg-blue-700 transition-colors",
        className
      )}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          initial={{ width: 0, height: 0, opacity: 0.5 }}
          animate={{ width: 500, height: 500, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </motion.button>
  );
};

/**
 * Glow Button - Button with glow effect
 */
export const GlowButton = ({
  children,
  className,
  glowColor = "#3b82f6",
  ...props
}) => {
  return (
    <motion.button
      className={cn(
        "relative inline-flex items-center justify-center",
        "px-6 py-3 font-medium bg-slate-900 text-white rounded-lg",
        "transition-all duration-300",
        className
      )}
      style={{
        boxShadow: `0 0 0px ${glowColor}`,
      }}
      whileHover={{
        boxShadow: `0 0 30px ${glowColor}`,
        scale: 1.02,
      }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

/**
 * Gradient Border Button
 */
export const GradientBorderButton = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className="relative p-[2px] rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 group">
      <motion.button
        className={cn(
          "relative w-full px-6 py-3 font-medium bg-white rounded-[6px]",
          "group-hover:bg-transparent group-hover:text-white transition-colors duration-300",
          className
        )}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.button>
    </div>
  );
};

/**
 * Arrow Button - Button with animated arrow
 */
export const ArrowButton = ({
  children,
  className,
  ...props
}) => {
  return (
    <motion.button
      className={cn(
        "inline-flex items-center gap-2 px-6 py-3 font-medium",
        "bg-slate-900 text-white rounded-lg group",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
      <motion.svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        initial={{ x: 0 }}
        whileHover={{ x: 5 }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </motion.svg>
    </motion.button>
  );
};

export default MagneticButton;

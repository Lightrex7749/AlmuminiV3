"use client";
import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Hover Card - Card with lift effect on hover
 */
export const HoverCard = ({
  children,
  className,
}) => {
  return (
    <motion.div
      className={cn(
        "relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-slate-200 dark:border-gray-700",
        "transition-shadow duration-300",
        className
      )}
      whileHover={{
        y: -8,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Tilt Card - 3D tilt effect on hover
 */
export const TiltCard = ({
  children,
  className,
  tiltAmount = 10,
}) => {
  const ref = React.useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const ySpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(ySpring, [-0.5, 0.5], [`${tiltAmount}deg`, `-${tiltAmount}deg`]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [`-${tiltAmount}deg`, `${tiltAmount}deg`]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-gray-700",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

/**
 * Glare Card - Card with glare effect
 */
export const GlareCard = ({
  children,
  className,
}) => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-gray-700",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glare effect */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 0.15 : 0,
          background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, white, transparent 50%)`,
        }}
      />
      {children}
    </div>
  );
};

/**
 * Focus Card - Blurs other cards on hover
 */
export const FocusCards = ({
  children,
  className,
}) => {
  const [hoveredIndex, setHoveredIndex] = React.useState(null);

  return (
    <div className={cn("grid gap-6", className)}>
      {React.Children.map(children, (child, index) => (
        <motion.div
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          animate={{
            opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.5,
            scale: hoveredIndex === index ? 1.02 : 1,
            filter: hoveredIndex === null || hoveredIndex === index ? "blur(0px)" : "blur(2px)",
          }}
          transition={{ duration: 0.3 }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Bento Card - Card for bento grid layouts
 */
export const BentoCard = ({
  children,
  className,
  icon,
  title,
  description,
}) => {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6",
        "border border-slate-200 dark:border-gray-700 shadow-sm",
        "group cursor-pointer",
        className
      )}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative space-y-4">
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
            {icon}
          </div>
        )}
        {title && <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>}
        {description && <p className="text-slate-600 dark:text-gray-400">{description}</p>}
        {children}
      </div>
    </motion.div>
  );
};

/**
 * Wobble Card - Card that wobbles on hover
 */
export const WobbleCard = ({
  children,
  className,
}) => {
  const ref = React.useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 400, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 400, damping: 20 });

  const translateX = useTransform(xSpring, [-0.5, 0.5], ["-3%", "3%"]);
  const translateY = useTransform(ySpring, [-0.5, 0.5], ["-3%", "3%"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        x: translateX,
        y: translateY,
      }}
      className={cn(
        "relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default HoverCard;

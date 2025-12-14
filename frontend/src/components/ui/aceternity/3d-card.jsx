"use client";
import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * 3D Card Container - Aceternity UI Style
 * A card with 3D perspective effect on hover
 */
export const CardContainer = ({ children, className, containerClassName }) => {
  const ref = React.useRef(null);
  const [isHovered, setIsHovered] = React.useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div className={cn("flex items-center justify-center", containerClassName)}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={cn("relative", className)}
      >
        {children}
      </motion.div>
    </div>
  );
};

/**
 * Card Body - Container for 3D card content
 */
export const CardBody = ({ children, className }) => {
  return (
    <div
      className={cn(
        "h-full w-full [transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]",
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * Card Item - Individual 3D card element
 */
export const CardItem = ({
  as: Component = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...props
}) => {
  const ref = React.useRef(null);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    const handleParentHover = () => setIsHovered(true);
    const handleParentLeave = () => setIsHovered(false);

    const parent = ref.current?.closest("[data-card-container]");
    if (parent) {
      parent.addEventListener("mouseenter", handleParentHover);
      parent.addEventListener("mouseleave", handleParentLeave);
      return () => {
        parent.removeEventListener("mouseenter", handleParentHover);
        parent.removeEventListener("mouseleave", handleParentLeave);
      };
    }
  }, []);

  return (
    <Component
      ref={ref}
      className={cn("transition-transform duration-200", className)}
      style={{
        transform: isHovered
          ? `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`
          : "translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)",
      }}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * Simple 3D Hover Card - Easy to use version
 */
export const Card3D = ({ children, className, intensity = 15 }) => {
  const ref = React.useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const ySpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(ySpring, [-0.5, 0.5], [`${intensity}deg`, `-${intensity}deg`]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [`-${intensity}deg`, `${intensity}deg`]);

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
        "relative rounded-xl bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg",
        "border border-slate-200/50 transition-shadow duration-300 hover:shadow-xl",
        className
      )}
    >
      <div style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
};

export default CardContainer;

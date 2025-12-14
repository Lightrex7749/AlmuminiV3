"use client";
import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export const DirectionAwareHover = ({
  imageUrl,
  children,
  childrenClassName,
  imageClassName,
  className,
}) => {
  const ref = useRef(null);

  const [direction, setDirection] = useState("left");

  const handleMouseEnter = (event) => {
    if (!ref.current) return;

    const direction = getDirection(event, ref.current);
    console.log("direction", direction);
    switch (direction) {
      case 0:
        setDirection("top");
        break;
      case 1:
        setDirection("right");
        break;
      case 2:
        setDirection("bottom");
        break;
      case 3:
        setDirection("left");
        break;
      default:
        setDirection("left");
        break;
    }
  };

  const getDirection = (ev, obj) => {
    const { width: w, height: h, left, top } = obj.getBoundingClientRect();
    const x = ev.clientX - left - (w / 2) * (w > h ? h / w : 1);
    const y = ev.clientY - top - (h / 2) * (h > w ? w / h : 1);
    const d = Math.round(Math.atan2(y, x) / 1.57079633 + 5) % 4;
    return d;
  };

  return (
    <motion.div
      onMouseEnter={handleMouseEnter}
      ref={ref}
      className={cn(
        "md:h-96 w-full bg-transparent rounded-lg overflow-hidden group/card relative",
        className
      )}
    >
      <AnimatedImageOverlay
        imageUrl={imageUrl}
        direction={direction}
        imageClassName={imageClassName}
      >
        <motion.div className="relative h-full w-full">
          {children}
        </motion.div>
      </AnimatedImageOverlay>
    </motion.div>
  );
};

export const AnimatedImageOverlay = ({
  imageUrl,
  children,
  direction,
  imageClassName,
}) => {
  const variants = {
    initial: {
      x: direction === "left" ? "-100%" : direction === "right" ? "100%" : "0%",
      y: direction === "top" ? "-100%" : direction === "bottom" ? "100%" : "0%",
    },
    exit: {
      x: direction === "left" ? "-100%" : direction === "right" ? "100%" : "0%",
      y: direction === "top" ? "-100%" : direction === "bottom" ? "100%" : "0%",
    },
  };
  return (
    <motion.div className="h-full w-full relative" initial="initial" whileHover="hovered">
      <motion.div className="group-hover/card:block hidden absolute inset-0 w-full h-full bg-black/40 z-10 transition duration-500" />
      <motion.div
        variants={variants}
        className="h-full w-full relative bg-gray-50 dark:bg-black"
        transition={{
          duration: 0.2,
          ease: "easeOut",
        }}
      >
        <img
          alt="image"
          className={cn(
            "h-full w-full object-cover scale-[1.15]",
            imageClassName
          )}
          src={imageUrl}
        />
      </motion.div>
      <motion.div
        variants={{
          initial: {
            opacity: 0,
          },
          hovered: {
            opacity: 1,
          },
        }}
        transition={{
          duration: 0.2,
          ease: "easeOut",
        }}
        className="absolute inset-0 z-20 flex px-4 py-4"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

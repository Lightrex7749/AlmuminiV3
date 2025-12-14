"use client";
import React from "react";
import { motion, stagger, useAnimate, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

// Re-export FlipWords from the dedicated component
export { FlipWords } from "../flip-words";

/**
 * Text Generate Effect - Aceternity UI Style
 * Fade in text word by word
 */
export const TextGenerateEffect = ({ words, className, filter = true, duration = 0.5 }) => {
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope, { once: true });
  const wordsArray = words.split(" ");

  React.useEffect(() => {
    if (isInView) {
      animate(
        "span",
        {
          opacity: 1,
          filter: filter ? "blur(0px)" : "none",
        },
        {
          duration: duration,
          delay: stagger(0.1),
        }
      );
    }
  }, [isInView, animate, filter, duration]);

  return (
    <div ref={scope} className={className}>
      {wordsArray.map((word, idx) => (
        <motion.span
          key={word + idx}
          className="opacity-0"
          style={{
            filter: filter ? "blur(10px)" : "none",
          }}
        >
          {word}{" "}
        </motion.span>
      ))}
    </div>
  );
};

/**
 * Typewriter Effect - Aceternity UI Style
 */
export const TypewriterEffect = ({ words, className, cursorClassName }) => {
  const [displayedText, setDisplayedText] = React.useState("");
  const [wordIndex, setWordIndex] = React.useState(0);
  const [charIndex, setCharIndex] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    const currentWord = words[wordIndex]?.text || "";
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentWord.length) {
          setDisplayedText(currentWord.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        if (charIndex > 0) {
          setDisplayedText(currentWord.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, wordIndex, words]);

  return (
    <span className={cn("inline-flex items-center", className)}>
      <span>{displayedText}</span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className={cn("inline-block w-[4px] h-[1em] bg-blue-600 ml-1", cursorClassName)}
      />
    </span>
  );
};

/**
 * Animated Shiny Text - Magic UI Style
 */
export const AnimatedShinyText = ({ children, className, shimmerWidth = 100 }) => {
  return (
    <span
      className={cn(
        "inline-flex animate-shimmer bg-clip-text text-transparent",
        "bg-[linear-gradient(110deg,#64748b,45%,#1e293b,55%,#64748b)]",
        "bg-[length:200%_100%]",
        className
      )}
      style={{
        backgroundSize: `${shimmerWidth}% 100%`,
      }}
    >
      {children}
    </span>
  );
};

/**
 * Gradient Heading - Beautiful gradient text
 */
export const GradientHeading = ({ 
  children, 
  className,
  gradient = "from-blue-600 via-purple-600 to-cyan-500"
}) => {
  return (
    <span
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        gradient,
        className
      )}
    >
      {children}
    </span>
  );
};

/**
 * Colourful Text - Aceternity UI Style
 */
export const ColourfulText = ({ children, className }) => {
  const colors = [
    "text-blue-500",
    "text-purple-500",
    "text-pink-500",
    "text-cyan-500",
    "text-green-500",
  ];
  const characters = String(children).split("");

  return (
    <span className={cn("inline-flex", className)}>
      {characters.map((char, idx) => (
        <motion.span
          key={idx}
          className={colors[idx % colors.length]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.03, duration: 0.3 }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
};

export default TextGenerateEffect;

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Magnetic Button - follows cursor within button bounds
const MagneticButton = ({ 
  children, 
  className = "", 
  magnetStrength = 0.4,
  ...props 
}) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * magnetStrength;
    const deltaY = (e.clientY - centerY) * magnetStrength;
    
    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300",
        "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
        "shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40",
        "px-6 py-3",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Ripple Button - Material Design style ripple effect
const RippleButton = ({ children, className = "", ...props }) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;
    
    const newRipple = { x, y, size, id: Date.now() };
    setRipples([...ripples, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "relative overflow-hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300",
        "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
        "shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40",
        "hover:-translate-y-1 px-6 py-3",
        className
      )}
      {...props}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ripple pointer-events-none"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
    </button>
  );
};

// Shimmer Button - Animated shine effect
const ShimmerButton = ({ children, className = "", shimmerColor = "rgba(255,255,255,0.4)", ...props }) => {
  return (
    <button
      className={cn(
        "relative overflow-hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300",
        "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
        "shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40",
        "hover:-translate-y-1 px-6 py-3",
        "group",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <div 
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
        }}
      />
    </button>
  );
};

// Neon Button - Glowing cyberpunk style
const NeonButton = ({ 
  children, 
  className = "", 
  glowColor = "rgb(59, 130, 246)",
  ...props 
}) => {
  return (
    <motion.button
      className={cn(
        "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-300",
        "bg-transparent border-2 text-white px-6 py-3",
        className
      )}
      style={{
        borderColor: glowColor,
        textShadow: `0 0 10px ${glowColor}`,
      }}
      whileHover={{
        boxShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}, 0 0 60px ${glowColor}`,
        scale: 1.05,
      }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Gradient Border Button - Animated gradient border
const GradientBorderButton = ({ children, className = "", ...props }) => {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300 animate-gradient-x bg-[length:200%_auto]" />
      <button
        className={cn(
          "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold",
          "bg-gray-900 text-white px-6 py-3",
          "hover:bg-gray-800 transition-colors",
          className
        )}
        {...props}
      >
        {children}
      </button>
    </div>
  );
};

// Liquid Button - Morphing blob effect
const LiquidButton = ({ children, className = "", ...props }) => {
  return (
    <motion.button
      className={cn(
        "relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold text-white px-8 py-4",
        className
      )}
      whileHover="hover"
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl"
        variants={{
          hover: {
            borderRadius: ["16px", "24px", "16px", "32px", "16px"],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          },
        }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export { 
  MagneticButton, 
  RippleButton, 
  ShimmerButton, 
  NeonButton, 
  GradientBorderButton,
  LiquidButton 
};
export default MagneticButton;

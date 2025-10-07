"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScaleInWhenVisibleProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  initialScale?: number;
  rotate?: number;
  className?: string;
}

export function ScaleInWhenVisible({
  children,
  delay = 0,
  duration = 0.5,
  initialScale = 0.8,
  rotate = 0,
  className = "",
}: ScaleInWhenVisibleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale, rotate }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration,
        delay,
        ease: [0.6, -0.05, 0.01, 0.99],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

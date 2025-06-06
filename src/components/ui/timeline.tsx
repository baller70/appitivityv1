"use client";
import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full bg-white dark:bg-neutral-950 font-sans md:px-10"
      ref={containerRef}
    >
      <div className="max-w-7xl mx-auto py-4 px-4 md:px-8 lg:px-10">
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
            className="flex justify-start pt-6 md:pt-16 md:gap-10"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <motion.div 
                className="h-10 absolute left-2 md:left-2 w-10 rounded-full bg-neutral-800 dark:bg-neutral-200 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 shadow-sm"
                whileInView={{ scale: [0.8, 1] }}
                transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <div className="h-3 w-3 rounded-full bg-white dark:bg-neutral-800" />
              </motion.div>
              
              <motion.h3 
                className="hidden md:block text-xl md:pl-20 md:text-4xl font-semibold uppercase text-black bg-white px-4 py-2 rounded-lg border-2 border-black shadow-lg tracking-tight"
                whileInView={{ 
                  opacity: [0, 1],
                  x: [-15, 0]
                }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1 + 0.2,
                  ease: "easeOut"
                }}
                viewport={{ once: true }}
              >
                {item.title}
              </motion.h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <motion.h3 
                className="md:hidden block text-2xl mb-4 text-left font-semibold uppercase text-black bg-white px-4 py-2 rounded-lg border-2 border-black shadow-lg tracking-tight"
                whileInView={{ opacity: [0, 1], y: [-10, 0] }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                {item.title}
              </motion.h3>
              {item.content}
            </div>
          </motion.div>
        ))}
        
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-neutral-200 dark:bg-neutral-800 [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-neutral-600 dark:bg-neutral-400 rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

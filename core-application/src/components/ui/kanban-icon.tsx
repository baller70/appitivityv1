"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface KanbanIconProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const KanbanIcon = ({ className, size = "md" }: KanbanIconProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  const cardSizes = {
    sm: { width: "w-0.5", height: "h-1" },
    md: { width: "w-1", height: "h-2" },
    lg: { width: "w-1.5", height: "h-3" }
  };

  const cardSize = cardSizes[size];

  return (
    <div className={cn("flex items-start gap-0.5", sizeClasses[size], className)}>
      {/* Column 1 */}
      <div className="flex flex-col gap-0.5 flex-1">
        <div className={cn("bg-white rounded-sm", cardSize.width, cardSize.height)} />
        <div className={cn("bg-white rounded-sm", cardSize.width, cardSize.height)} />
        <div className={cn("bg-white rounded-sm", cardSize.width, cardSize.height)} />
      </div>
      
      {/* Column 2 */}
      <div className="flex flex-col gap-0.5 flex-1">
        <div className={cn("bg-white rounded-sm", cardSize.width, cardSize.height)} />
        <div className={cn("bg-white rounded-sm", cardSize.width, cardSize.height)} />
      </div>
      
      {/* Column 3 */}
      <div className="flex flex-col gap-0.5 flex-1">
        <div className={cn("bg-white rounded-sm", cardSize.width, cardSize.height)} />
        <div className={cn("bg-white rounded-sm", cardSize.width, cardSize.height)} />
        <div className={cn("bg-white rounded-sm", cardSize.width, cardSize.height)} />
        <div className={cn("bg-white rounded-sm", cardSize.width, cardSize.height)} />
      </div>
    </div>
  );
}; 
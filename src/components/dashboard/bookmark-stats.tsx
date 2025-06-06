"use client";

import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Bookmark, TrendingUp, BarChart3, Heart } from "lucide-react";
import type { BookmarkWithRelations } from '../../lib/services/bookmarks';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

interface BookmarkStatsProps {
  bookmarks: BookmarkWithRelations[];
}

export function BookmarkStats({ bookmarks }: BookmarkStatsProps) {
  // Calculate stats
  const totalBookmarks = bookmarks.length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthBookmarks = bookmarks.filter(bookmark => {
    if (!bookmark.created_at) return false;
    const bookmarkDate = new Date(bookmark.created_at);
    return bookmarkDate.getMonth() === currentMonth && bookmarkDate.getFullYear() === currentYear;
  }).length;
  
  const favoriteBookmarks = bookmarks.filter(bookmark => bookmark.is_favorite).length;
  const totalVisits = bookmarks.reduce((sum, bookmark) => sum + (bookmark.visit_count || 0), 0);

  const summary = [
    {
      name: "Total Bookmarks",
      value: totalBookmarks.toString(),
      change: `+${Math.max(0, thisMonthBookmarks)}`,
      percentageChange: thisMonthBookmarks > 0 ? `+${Math.round((thisMonthBookmarks / Math.max(1, totalBookmarks - thisMonthBookmarks)) * 100)}%` : "0%",
      changeType: "positive" as const,
      icon: Bookmark,
      color: "hsl(217.2 91.2% 59.8%)", // Blue
    },
    {
      name: "This Month",
      value: `+${thisMonthBookmarks}`,
      change: `${thisMonthBookmarks}`,
      percentageChange: thisMonthBookmarks > 0 ? `+${Math.round((thisMonthBookmarks / Math.max(1, totalBookmarks)) * 100)}%` : "0%",
      changeType: "positive" as const,
      icon: TrendingUp,
      color: "hsl(142.1 76.2% 36.3%)", // Green
    },
    {
      name: "Total Visits",
      value: totalVisits.toString(),
      change: `${totalVisits}`,
      percentageChange: totalVisits > 0 ? "+0%" : "0%",
      changeType: totalVisits > 0 ? "positive" as const : "neutral" as const,
      icon: BarChart3,
      color: "hsl(262.1 83.3% 57.8%)", // Purple
    },
    {
      name: "Favorites",
      value: favoriteBookmarks.toString(),
      change: `${favoriteBookmarks}`,
      percentageChange: favoriteBookmarks > 0 ? `${Math.round((favoriteBookmarks / Math.max(1, totalBookmarks)) * 100)}%` : "0%",
      changeType: favoriteBookmarks > 0 ? "positive" as const : "neutral" as const,
      icon: Heart,
      color: "hsl(45.4 93.4% 47.5%)", // Yellow/Orange
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
      <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full">
        {summary.map((item) => {
          const IconComponent = item.icon;

          return (
            <Card key={item.name} className="p-0 overflow-hidden border shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-xl transition-shadow duration-200">
              <CardContent className="p-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <dt className="text-sm font-medium text-muted-foreground">
                      {item.name}
                    </dt>
                    <div 
                      className="w-10 h-10 flex items-center justify-center rounded-lg"
                      style={{ 
                        backgroundColor: item.color + '15',
                        border: `1px solid ${item.color}25`
                      }}
                    >
                      <IconComponent 
                        className="h-5 w-5" 
                        style={{ color: item.color }} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <dd className="text-3xl font-bold text-foreground">
                      {item.value}
                    </dd>
                    <dd className="flex items-center space-x-2 text-sm">
                      <span
                        className={cn(
                          item.changeType === "positive"
                            ? "text-green-600 dark:text-green-500"
                            : "text-muted-foreground",
                          "font-medium"
                        )}
                      >
                        {item.percentageChange}
                      </span>
                      <span className="text-muted-foreground">of total</span>
                    </dd>
                  </div>
                </div>

                {/* Simple visual indicator */}
                <div className="mt-4 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      backgroundColor: item.color,
                      width: `${Math.min(100, Math.max(5, (parseInt(item.value.replace('+', '')) / Math.max(1, totalBookmarks)) * 100))}%`
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </dl>
    </div>
  );
} 
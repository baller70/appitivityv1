import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search, X, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface BookmarkCardData {
  id: string;
  title: string;
  url: string;
  faviconUrl?: string;
  tags: string[];
  lastVisited?: Date;
  visitCount?: number;
}

interface RelatedGalleryProps {
  items: BookmarkCardData[];
  onAdd(): void;
  onEdit(id: string): void;
  onDelete(id: string): void;
  onReorder(newOrder: BookmarkCardData[]): void;
}

export function RelatedBookmarksSection({
  items,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
}: RelatedGalleryProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filteredItems, setFilteredItems] = useState(items);

  // debounce search
  useEffect(() => {
    const id = setTimeout(() => {
      let next = items;
      if (search.trim()) {
        const q = search.toLowerCase();
        next = next.filter((i) => i.title.toLowerCase().includes(q));
      }
      if (activeFilter === "tags") {
        next = next.filter((i) => i.tags.length);
      } else if (activeFilter === "domain") {
        next = next.filter((i) => {
          try {
            return new URL(i.url).hostname === new URL(items[0].url).hostname;
          } catch {
            return false;
          }
        });
      } else if (activeFilter === "manual") {
        // placeholder – manual links flag not yet implemented
      }
      setFilteredItems(next);
    }, 200);
    return () => clearTimeout(id);
  }, [search, activeFilter, items]);

  /* -------------------- DND ------------------- */
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = filteredItems.findIndex((i) => i.id === active.id);
    const newIndex = filteredItems.findIndex((i) => i.id === over.id);
    const newOrder = arrayMove(filteredItems, oldIndex, newIndex);
    setFilteredItems(newOrder);
    onReorder(newOrder);
  };

  /* -------------------- RENDER ------------------- */
  return (
    <div className="space-y-4">
      <SectionHeader count={items.length} onAdd={onAdd} />
      <FilterRow
        search={search}
        setSearch={setSearch}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />
      {filteredItems.length === 0 ? (
        <EmptyState onAdd={onAdd} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={filteredItems} strategy={rectSortingStrategy}>
            <BookmarkMasonryGrid
              items={filteredItems}
              onEdit={onEdit}
              onDelete={onDelete}
              onAdd={onAdd}
            />
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

/* ---------------- HEADER ------------------ */
function SectionHeader({ count, onAdd }: { count: number; onAdd: () => void }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-card/90 backdrop-blur rounded-t-2xl px-4 py-2 border-b border-border">
      <h2 className="text-sm font-semibold uppercase">
        RELATED BOOKMARKS (<span>{count}</span>)
      </h2>
      <Button size="sm" onClick={onAdd} className="bg-primary text-primary-foreground uppercase">
        <Plus className="h-4 w-4 mr-1" /> NEW LINKS
      </Button>
    </div>
  );
}

/* ---------------- FILTER ROW ------------------ */
interface FilterRowProps {
  search: string;
  setSearch: (v: string) => void;
  activeFilter: string | null;
  setActiveFilter: (v: string | null) => void;
}

function FilterRow({ search, setSearch, activeFilter, setActiveFilter }: FilterRowProps) {
  const toggleChip = (chip: string) => {
    setActiveFilter(activeFilter === chip ? null : chip);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 px-4">
      <div className="flex gap-1">
        <Chip label="Similar Tags" active={activeFilter === "tags"} onClick={() => toggleChip("tags")} />
        <Chip label="Same Domain" active={activeFilter === "domain"} onClick={() => toggleChip("domain")} />
        <Chip label="Manually Linked" active={activeFilter === "manual"} onClick={() => toggleChip("manual")} />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="pl-8 h-9 w-40 md:w-60"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSearch("");
            setActiveFilter(null);
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
        active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/70"
      )}
    >
      {label}
    </button>
  );
}

/* ---------------- GRID ------------------ */
interface GridProps {
  items: BookmarkCardData[];
  onEdit(id: string): void;
  onDelete(id: string): void;
  onAdd(): void;
}

function BookmarkMasonryGrid({ items, onEdit, onDelete, onAdd }: GridProps) {
  return (
    <div
      className="grid gap-4 px-4"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))",
      }}
    >
      <AnimatePresence>
        {items.map((item) => (
          <SortableCard
            key={item.id}
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
      {/* Add tile */}
      <button
        onClick={onAdd}
        className="flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-2xl text-muted-foreground hover:bg-muted/30 h-40 transition-colors"
      >
        <Plus className="h-6 w-6" />
        <span className="text-sm uppercase">ADD BOOKMARK</span>
      </button>
    </div>
  );
}

/* ---------------- CARD ------------------ */
function SortableCard({ item, onEdit, onDelete }: { item: BookmarkCardData; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <motion.div
      layout
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "relative group bg-card border border-border rounded-2xl p-4 shadow-md hover:shadow-lg transition-transform",
        isDragging && "opacity-70"
      )}
      {...attributes}
      {...listeners}
    >
      {/* Hover actions */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button size="icon" variant="ghost" onClick={() => onEdit(item.id)}>
          ✎
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onDelete(item.id)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex items-center gap-2 mb-2">
        {item.faviconUrl ? (
          <img src={item.faviconUrl} alt="favicon" className="h-4 w-4" />
        ) : (
          <Tag className="h-4 w-4 text-muted-foreground" />
        )}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-sm font-medium hover:underline"
        >
          {item.title}
        </a>
      </div>
      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-2">
        {item.tags.slice(0, 3).map((t) => (
          <Badge key={t} variant="outline" className="text-xs">
            {t}
          </Badge>
        ))}
      </div>
      {/* Stats */}
      <div className="text-xs text-muted-foreground flex justify-between">
        <span>👁 {item.visitCount ?? 0}</span>
        {item.lastVisited && (
          <span>
            �� {item.lastVisited.toLocaleDateString(undefined, {
              day: "2-digit",
              month: "short",
            })}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ---------------- EMPTY STATE ------------------ */
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      {/* Placeholder illustration */}
      <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
        <rect width="18" height="14" x="3" y="5" rx="2" ry="2"></rect>
        <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"></path>
      </svg>
      <p className="text-sm max-w-xs">
        No related bookmarks yet. Link sites or tools that support your workflow.
      </p>
      <Button onClick={onAdd} className="bg-primary text-primary-foreground uppercase">
        <Plus className="h-4 w-4 mr-1" /> ADD BOOKMARK
      </Button>
    </div>
  );
} 
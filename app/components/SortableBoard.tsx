"use client";

import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type SortableBoardProps = {
  id: string;
  children: ReactNode;
};

export default function SortableBoard({ id, children }: SortableBoardProps) {
  const { setNodeRef: setDropRef } = useDroppable({ id });
  const {
    setNodeRef: setSortRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      className=""
      ref={(node) => {
        setDropRef(node);
        setSortRef(node);
      }}
      {...attributes}
      {...listeners}
      style={{
        // Keep original board invisible while dragging; DragOverlay shows the preview
        transform: isDragging ? undefined : CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 9999 : undefined,
        position: isDragging ? "relative" : undefined,
        opacity: isDragging ? 0 : 1,
      }}
    >
      {children}
    </div>
  );
}


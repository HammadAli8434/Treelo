"use client";

import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Todo } from "../page";

type SortableTodoProps = {
  id: string;
  todo: Todo;
  boardId: number;
  children: ReactNode;
};

export default function SortableTodo({
  id,
  todo,
  boardId,
  children,
}: SortableTodoProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { type: "todo", todo },
  });

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`rounded-lg bg-white px-4 py-3 flex justify-between items-center shadow-sm cursor-move${isDragging ? " z-50 scale-105 shadow-lg" : ""
        }`}
      style={{
        transform: isDragging ? undefined : CSS.Transform.toString(transform),
        transition: transition || "transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: "transform",
        opacity: isDragging ? 0 : 1,
      }}
    >
      {children}
    </li>
  );
}
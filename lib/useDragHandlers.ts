"use client";

import { useState } from "react";
import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { supabase } from "./supabaseClient";
import type { Board, Todo } from "./types";

export function useDragHandlers(
  boards: Board[],
  todos: Todo[],
  setBoards: React.Dispatch<React.SetStateAction<Board[]>>,
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>,
  todosForBoard: (boardId: number) => Todo[],
) {
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeIdStr = active.id as string;

    // Board drag
    if (activeIdStr.startsWith("board-")) {
      const boardId = parseInt(activeIdStr.replace("board-", ""));
      const board = boards.find((b) => b.id === boardId);
      if (board) setActiveBoard(board);
      return;
    }

    // Todo drag
    const data = active.data.current as
      | { type: "todo"; todo: Todo }
      | undefined;

    if (data?.type === "todo") {
      setActiveTodo(data.todo);
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveBoard(null);
      setActiveTodo(null);
      return;
    }

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    setActiveBoard(null);
    setActiveTodo(null);

    // ── Board reorder ──
    if (activeIdStr.startsWith("board-") && overIdStr.startsWith("board-")) {
      const activeIdx = boards.findIndex(
        (b) => b.id === parseInt(activeIdStr.replace("board-", "")),
      );
      const overIdx = boards.findIndex(
        (b) => b.id === parseInt(overIdStr.replace("board-", "")),
      );

      if (activeIdx === overIdx) return;

      const reordered = arrayMove(boards, activeIdx, overIdx);
      setBoards(reordered);

      // Update positions in DB
      const updates = reordered.map((b, i) => ({
        id: b.id,
        user_id: b.user_id,
        name: b.name,
        position: i,
      }));

      const { error } = await supabase.from("boards").upsert(updates);
      if (error) console.error("Error reordering boards:", error);
      return;
    }

    // ── Todo reorder / cross-board move ──
    const data = active.data.current as
      | { type: "todo"; todo: Todo }
      | undefined;
    if (!data || data.type !== "todo") return;

    const draggedTodo = data.todo;

    // Figure out what we're dropping onto
    let targetBoardId: number;
    let targetPosition: number;

    if (overIdStr.startsWith("todo-")) {
      // Dropping onto another todo
      const overTodoId = parseInt(overIdStr.replace("todo-", ""));
      const overTodo = todos.find((t) => t.id === overTodoId);
      if (!overTodo) return;
      targetBoardId = overTodo.board_id;
      targetPosition = overTodo.position;
    } else if (overIdStr.startsWith("board-")) {
      // Dropping onto a board (empty area)
      targetBoardId = parseInt(overIdStr.replace("board-", ""));
      const boardTodos = todosForBoard(targetBoardId);
      targetPosition = boardTodos.length;
    } else {
      return;
    }

    if (draggedTodo.board_id === targetBoardId) {
      const boardTodos = todosForBoard(targetBoardId);
      const fromIdx = boardTodos.findIndex((t) => t.id === draggedTodo.id);
      const toIdx = boardTodos.findIndex((t) => t.position === targetPosition);
      if (fromIdx === -1 || fromIdx === toIdx) return;

      const reordered = arrayMove(boardTodos, fromIdx, toIdx >= 0 ? toIdx : boardTodos.length - 1);
      const updatedTodos = reordered.map((t, i) => ({ ...t, position: i }));

      setTodos((prev) => {
        const others = prev.filter((t) => t.board_id !== targetBoardId);
        return [...others, ...updatedTodos];
      });

      const updates = updatedTodos.map((t) => ({
        id: t.id,
        board_id: t.board_id,
        content: t.content,
        position: t.position,
      }));
      const { error } = await supabase.from("todos").upsert(updates);
      if (error) console.error("Error reordering todos:", error);
    } else {
      const sourceTodos = todosForBoard(draggedTodo.board_id).filter(
        (t) => t.id !== draggedTodo.id,
      );
      const destTodos = todosForBoard(targetBoardId);
      const updatedSource = sourceTodos.map((t, i) => ({ ...t, position: i }));
      const movedTodo: Todo = {
        ...draggedTodo,
        board_id: targetBoardId,
        position: targetPosition,
      };
      const newDest = [...destTodos];
      newDest.splice(targetPosition, 0, movedTodo);
      const updatedDest = newDest.map((t, i) => ({ ...t, position: i }));

      setTodos((prev) => {
        const others = prev.filter(
          (t) =>
            t.board_id !== draggedTodo.board_id && t.board_id !== targetBoardId,
        );
        return [...others, ...updatedSource, ...updatedDest];
      });

      const allUpdates = [...updatedSource, ...updatedDest].map((t) => ({
        id: t.id,
        board_id: t.board_id,
        content: t.content,
        position: t.position,
      }));
      const { error } = await supabase.from("todos").upsert(allUpdates);
      if (error) console.error("Error moving todo across boards:", error);
    }
  };

  return {
    activeBoard,
    activeTodo,
    onDragStart,
    onDragEnd,
  };
}
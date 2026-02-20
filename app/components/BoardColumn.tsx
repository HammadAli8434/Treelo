"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableBoard from "./SortableBoard";
import TodoItem from "./TodoItem";
import type { Board, Todo } from "../page";

type BoardColumnProps = {
  board: Board;
  todos: Todo[];
  editingTodoId: number | null;
  editText: string;
  onStartEdit: (todoId: number, text: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDeleteTodo: (todoId: number) => void;
  setEditText: (text: string) => void;
};

export default function BoardColumn({
  board,
  todos,
  editingTodoId,
  editText,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDeleteTodo,
  setEditText,
}: BoardColumnProps) {
  return (
    <SortableBoard id={`board-${board.id}`}>
      <div className="min-w-[320px] max-w-[320px] h-[430px] rounded-2xl bg-slate-200 border border-slate-300 p-5 flex flex-col">
        <h3 className="mb-4 text-lg font-semibold text-center bg-blue-800 bg-clip-text text-transparent">
          {board.name.toUpperCase()}
        </h3>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <SortableContext
            items={todos.map((t) => `todo-${t.id}`)}
            strategy={verticalListSortingStrategy}
          >
            {todos.length === 0 ? (
              <p className="text-sm text-gray-400 text-center italic">
                No todos here
              </p>
            ) : (
              <ul className="space-y-3">
                {todos.map((todo) => {
                  const isEditing = editingTodoId === todo.id;

                  return (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      boardId={board.id}
                      isEditing={isEditing}
                      editText={editText}
                      onStartEdit={onStartEdit}
                      onSaveEdit={onSaveEdit}
                      onCancelEdit={onCancelEdit}
                      onDelete={onDeleteTodo}
                      setEditText={setEditText}
                    />
                  );
                })}
              </ul>
            )}
          </SortableContext>
        </div>
      </div>
    </SortableBoard>
  );
}

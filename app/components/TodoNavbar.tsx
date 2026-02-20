"use client";

import type { Board } from "../page";

type TodoNavbarProps = {
  todoText: string;
  onTodoTextChange: (value: string) => void;
  selectedBoardId: number | null;
  boards: Board[];
  onSelectedBoardChange: (id: number) => void;
  onAddTodo: () => void;
  onAddBoardClick: () => void;
  onSignOut?: () => void;
};

export default function TodoNavbar({
  todoText,
  onTodoTextChange,
  selectedBoardId,
  boards,
  onSelectedBoardChange,
  onAddTodo,
  onAddBoardClick,
  onSignOut,
}: TodoNavbarProps) {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-4 items-center justify-between">
        <h1 className="text-xl font-bold bg-blue-600 bg-clip-text text-transparent">
          Todo Cards
        </h1>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            value={todoText}
            onChange={(e) => onTodoTextChange(e.target.value)}
            placeholder="Enter Here"
            className="rounded-lg border border-black-800 px-4 py-2 text-sm w-full sm:w-56"
          />
          <select
            value={selectedBoardId ?? ""}
            onChange={(e) => onSelectedBoardChange(Number(e.target.value))}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm cursor-pointer text-white"
          >
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name.toUpperCase()}
              </option>
            ))}
          </select>
          <button
            onClick={onAddTodo}
            className="px-3 sm:px-5 py-2 rounded-lg bg-blue-600 text-white text-xs sm:text-sm shadow-md cursor-pointer"
          >
            Add Todo
          </button>
          <button
            onClick={onAddBoardClick}
            className="px-3 sm:px-5 py-2 rounded-lg bg-blue-600 text-white text-xs sm:text-sm shadow-md cursor-pointer"
          >
            Add board
          </button>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="px-3 sm:px-4 py-2 rounded-lg border border-slate-300 text-white text-xs sm:text-sm shadow-sm cursor-pointer bg-blue-600"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
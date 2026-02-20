"use client";

import { DragOverlay } from "@dnd-kit/core";
import type { Board, Todo } from "../page";

type BoardOverlaysProps = {
    activeBoard: Board | null;
    activeTodo: Todo | null;
    todosForBoard: (boardId: number) => Todo[];
};

export default function BoardOverlays({
    activeBoard,
    activeTodo,
    todosForBoard,
}: BoardOverlaysProps) {
    return (
        <DragOverlay>
            {activeBoard && (() => {
                const boardTodos = todosForBoard(activeBoard.id);
                return (
                    <div className="min-w-[320px] max-w-[320px] h-[430px] rounded-2xl bg-slate-200 border border-slate-300 p-5 flex flex-col">
                        <h3 className="mb-4 text-lg font-semibold text-center bg-blue-800 bg-clip-text text-transparent">
                            {activeBoard.name.toUpperCase()}
                        </h3>
                        <div className="flex-1 overflow-y-auto">
                            {boardTodos.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center italic">
                                    No todos here
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {boardTodos.map((t) => (
                                        <li
                                            key={t.id}
                                            className="rounded-lg bg-white px-4 py-3 flex justify-between items-center shadow-sm"
                                        >
                                            <span className="text-sm text-gray-700 flex-1 pr-2">
                                                {t.content}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                );
            })()}

            {!activeBoard && activeTodo && (
                <li className="rounded-lg bg-white px-4 py-3 flex justify-between items-center shadow-lg cursor-move">
                    <span className="text-sm text-gray-700 flex-1 pr-2">
                        {activeTodo.content}
                    </span>
                </li>
            )}
        </DragOverlay>
    );
}

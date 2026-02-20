"use client";

import { FaEdit, FaTrash } from "react-icons/fa";
import SortableTodo from "./SortableTodo";
import type { Todo } from "../page";

type TodoItemProps = {
    todo: Todo;
    boardId: number;
    isEditing: boolean;
    editText: string;
    onStartEdit: (todoId: number, text: string) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onDelete: (todoId: number) => void;
    setEditText: (text: string) => void;
};

export default function TodoItem({
    todo,
    boardId,
    isEditing,
    editText,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    onDelete,
    setEditText,
}: TodoItemProps) {
    return (
        <SortableTodo id={`todo-${todo.id}`} todo={todo} boardId={boardId}>
            {isEditing ? (
                <div className="flex w-full gap-2 items-center">
                    <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="rounded-md border px-2 py-1 text-sm flex-1"
                        autoFocus
                    />
                    <button
                        onClick={onSaveEdit}
                        className="text-green-600 text-sm cursor-pointer"
                    >
                        Save
                    </button>
                    <button
                        onClick={onCancelEdit}
                        className="text-red-600 text-sm cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <div className="flex justify-between w-full items-start">
                    <span className="text-sm text-gray-700 flex-1 pr-2">{todo.content}</span>
                    <div className="flex gap-3 mt-1">
                        <button
                            onClick={() => onStartEdit(todo.id, todo.content)}
                            className="text-blue-600 text-sm cursor-pointer flex items-center"
                            aria-label="Edit todo"
                            title="Edit"
                        >
                            <FaEdit />
                        </button>
                        <button
                            onClick={() => onDelete(todo.id)}
                            className="text-red-600 text-sm cursor-pointer flex items-center"
                            aria-label="Delete todo"
                            title="Delete"
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>
            )}
        </SortableTodo>
    );
}

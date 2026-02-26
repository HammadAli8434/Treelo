"use client";
import type { Todo } from "../../lib/types";

type TodoDetailModalProps = {
  show: boolean;
  todo: Todo | null;
  description: string;
  onDescriptionChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function TodoDetailModal({
  show,
  todo,
  description,
  onDescriptionChange,
  onCancel,
  onSave,
}: TodoDetailModalProps) {
  if (!show || !todo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md mx-4 shadow-xl">
        <h2 className="text-lg font-semibold mb-4 text-center">
          Todo Description
        </h2>
        <p className="mb-2 text-sm text-gray-600 ">Todo: {todo.content}</p>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Add a description..."
          className="w-full border-2 border-blue-300 rounded-md px-3 py-2 mb-4 text-sm h-32 resize-none bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="text-sm text-gray-600 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
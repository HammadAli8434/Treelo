"use client";

type AddBoardModalProps = {
  show: boolean;
  newBoardName: string;
  onNewBoardNameChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function AddBoardModal({  
  show,
  newBoardName,
  onNewBoardNameChange,
  onCancel,
  onConfirm,
}: AddBoardModalProps) {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 w-80 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Add New Board</h2>
        <input
          value={newBoardName}
          onChange={(e) => onNewBoardNameChange(e.target.value)}
          placeholder="Board name"
          className="w-full border rounded-md px-3 py-2 mb-4 text-sm"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="text-sm text-gray-600 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
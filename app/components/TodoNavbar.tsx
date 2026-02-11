"use client";

type TodoNavbarProps = {
  todo: string;
  onTodoChange: (value: string) => void;
  selectedCard: string;
  boards: string[];
  onSelectedCardChange: (value: string) => void;
  onAddTodo: () => void;
  onAddBoardClick: () => void;
};

export default function TodoNavbar({
  todo,
  onTodoChange,
  selectedCard,
  boards,
  onSelectedCardChange,
  onAddTodo,
  onAddBoardClick,
}: TodoNavbarProps) {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-4 items-center justify-between">
        <h1 className="text-xl font-bold bg-blue-600 bg-clip-text text-transparent">
          Todo Cards
        </h1>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            value={todo}
            onChange={(e) => onTodoChange(e.target.value)}
            placeholder="Enter Here"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm w-56"
          />
          <select
            value={selectedCard}
            onChange={(e) => onSelectedCardChange(e.target.value)}
            className="rounded-lg border border-gray-300 bg-blue-600 px-4 py-2 text-sm cursor-pointer text-white"
          >
            {boards.map((card) => (
              <option key={card} value={card}>
                {card.toUpperCase()}
              </option>
            ))}
          </select>
          <button
            onClick={onAddTodo}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm shadow-md cursor-pointer"
          >
            Add Todo
          </button>
          <button
            onClick={onAddBoardClick}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm shadow-md cursor-pointer"
          >
            Add board
          </button>
        </div>
      </div>
    </nav>
  );
}


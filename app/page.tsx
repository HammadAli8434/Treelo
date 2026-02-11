"use client";
import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableBoard from "./components/SortableBoard";
import SortableTodo from "./components/SortableTodo";
import TodoNavbar from "./components/TodoNavbar";
import AddBoardModal from "./components/AddBoardModal";

type CardKey = string;
type TodoId = string;

type EditingState = {
  card: CardKey;
  index: number;
} | null;

export default function Page() {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const [boards, setBoards] = useState<CardKey[]>(["card1", "card2", "card3"]);

  const [selectedCard, setSelectedCard] = useState<CardKey>("card1");
  const [todo, setTodo] = useState("");

  const [cards, setCards] = useState<Record<CardKey, string[]>>({
    card1: [],
    card2: [],
    card3: [],
  });

  const [editing, setEditing] = useState<EditingState>(null);
  const [editText, setEditText] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [activeBoard, setActiveBoard] = useState<CardKey | null>(null);
  const [activeTodo, setActiveTodo] = useState<{
    id: TodoId;
    card: CardKey;
    index: number;
  } | null>(null);

  const addTodo = () => {
    if (!todo.trim()) return;

    setCards((prev) => ({
      ...prev,
      [selectedCard]: [...prev[selectedCard], todo],
    }));

    setTodo("");
  };

  const deleteTodo = (card: CardKey, index: number) => {
    setCards((prev) => ({
      ...prev,
      [card]: prev[card].filter((_, i) => i !== index),
    }));
  };

  const startEdit = (card: CardKey, index: number, text: string) => {
    setEditing({ card, index });
    setEditText(text);
  };

  const saveEdit = () => {
    if (!editing || !editText.trim()) return;

    setCards((prev) => ({
      ...prev,
      [editing.card]: prev[editing.card].map((t, i) =>
        i === editing.index ? editText : t,
      ),
    }));

    setEditing(null);
    setEditText("");
  };

  const addBoard = () => {
    if (!newBoardName.trim()) return;
    if (boards.includes(newBoardName)) return;

    setBoards((prev) => [...prev, newBoardName]);
    setCards((prev) => ({ ...prev, [newBoardName]: [] }));
    setSelectedCard(newBoardName);

    setNewBoardName("");
    setShowModal(false);
  };

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (boards.includes(active.id as CardKey)) {
      setActiveBoard(active.id as CardKey);
      return;
    }

    const data = active.data.current as
      | { type: "todo"; card: CardKey; index: number; id: TodoId }
      | undefined;

    if (data?.type === "todo") {
      setActiveTodo({ id: data.id, card: data.card, index: data.index });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Clear active items for DragOverlay
    setActiveBoard(null);
    setActiveTodo(null);

    if (
      boards.includes(active.id as CardKey) &&
      boards.includes(over.id as CardKey)
    ) {
      setBoards((prev) =>
        arrayMove(
          prev,
          prev.indexOf(active.id as CardKey),
          prev.indexOf(over.id as CardKey),
        ),
      );
      return;
    }

    const data = active.data.current;
    if (!data) return;

    const fromCard = data.card as CardKey;
    const fromIndex = data.index as number;
    const overIdParts = (over.id as string).split("-");
    const toCard = overIdParts[0];
    const overIndex = overIdParts[1] ? parseInt(overIdParts[1]) : null;
    if (!cards[toCard]) return;

    setCards((prev) => {
      if (fromCard === toCard) {
        const newIndex =
          overIndex !== null ? overIndex : prev[toCard].length - 1;
        const newTodos = arrayMove(prev[toCard], fromIndex, newIndex);
        return { ...prev, [toCard]: newTodos };
      } else {
        const source = [...prev[fromCard]];
        const [moved] = source.splice(fromIndex, 1);
        const target = [...prev[toCard]];
        const insertIndex = overIndex !== null ? overIndex : target.length;
        target.splice(insertIndex, 0, moved);
        return {
          ...prev,
          [fromCard]: source,
          [toCard]: target,
        };
      }
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="min-h-screen bg-purple-700 from-blue-100 via-indigo-100 to-purple-100">
        <TodoNavbar
          todo={todo}
          onTodoChange={setTodo}
          selectedCard={selectedCard}
          boards={boards}
          onSelectedCardChange={setSelectedCard}
          onAddTodo={addTodo}
          onAddBoardClick={() => setShowModal(true)}
        />

        <div className="px-6 py-10">
          <SortableContext
            items={boards}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-6 overflow-x-auto pb-8">
              {boards.map((card) => (
                <SortableBoard key={card} id={card}>
                  <div className="min-w-[320px] max-w-[320px] h-[430px] rounded-2xl bg-slate-200 border border-slate-300 p-5 flex flex-col">
                    <h3 className="mb-4 text-lg font-semibold text-center bg-blue-800 bg-clip-text text-transparent">
                      {card.toUpperCase()}
                    </h3>
                    <div className="flex-1 overflow-y-auto">
                      <SortableContext  
                        items={cards[card].map((_, i) => `${card}-${i}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        {cards[card].length === 0 ? (
                          <p className="text-sm text-gray-400 text-center italic">
                            No todos here
                          </p>
                        ) : (
                          <ul className="space-y-3">
                            {cards[card].map((t, i) => {
                              const isEditing =
                                editing?.card === card && editing?.index === i;

                              return (
                                <SortableTodo
                                  key={`${card}-${i}`}
                                  id={`${card}-${i}`}
                                  card={card}
                                  index={i}
                                >
                                  {isEditing ? (
                                    <div className="flex w-full gap-2 items-center">
                                      <input
                                        value={editText}
                                        onChange={(e) =>
                                          setEditText(e.target.value)
                                        }
                                        className="rounded-md border px-2 py-1 text-sm flex-1"
                                      />
                                      <button
                                        onClick={saveEdit}
                                        className="text-green-600 text-sm cursor-pointer"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditing(null);
                                          setEditText("");
                                        }}
                                        className="text-red-600 text-sm cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex justify-between w-full items-start">
                                      <span className="text-sm text-gray-700 flex-1 pr-2">
                                        {t}
                                      </span>
                                      <div className="flex gap-3 mt-1">
                                        <button
                                          onClick={() => startEdit(card, i, t)}
                                          className="text-blue-600 text-sm cursor-pointer"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => deleteTodo(card, i)}
                                          className="text-red-600 text-sm cursor-pointer"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </SortableTodo>
                              );
                            })}
                          </ul>
                        )}
                      </SortableContext>
                    </div>
                  </div>
                </SortableBoard>
              ))}
            </div>
          </SortableContext>
        </div>

        {/* DRAG OVERLAY FOR BOARDS AND TODOS */}
        <DragOverlay>
          {activeBoard && (
            <div className="min-w-[320px] max-w-[320px] h-[430px] rounded-2xl bg-slate-200 border border-slate-300 p-5 flex flex-col">
              <h3 className="mb-4 text-lg font-semibold text-center bg-blue-800 bg-clip-text text-transparent">
                {activeBoard.toUpperCase()}
              </h3>
              <div className="flex-1 overflow-y-auto">
                {cards[activeBoard].length === 0 ? (
                  <p className="text-sm text-gray-400 text-center italic">
                    No todos here
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {cards[activeBoard].map((t, i) => (
                      <li
                        key={`${activeBoard}-${i}`}
                        className="rounded-lg bg-white px-4 py-3 flex justify-between items-center shadow-sm"
                      >
                        <span className="text-sm text-gray-700 flex-1 pr-2">
                          {t}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {!activeBoard && activeTodo && (
            <li className="rounded-lg bg-white px-4 py-3 flex justify-between items-center shadow-lg cursor-move">
              <span className="text-sm text-gray-700 flex-1 pr-2">
                {cards[activeTodo.card][activeTodo.index]}
              </span>
            </li>
          )}
        </DragOverlay>

        <AddBoardModal
          show={showModal}
          newBoardName={newBoardName}
          onNewBoardNameChange={setNewBoardName}
          onCancel={() => setShowModal(false)}
          onConfirm={addBoard}
        />
      </div>
    </DndContext>
  );
}

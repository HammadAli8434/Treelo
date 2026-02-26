"use client";
  import {                                                                             
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";

import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
  
import TodoNavbar from "./TodoNavbar";
import AddBoardModal from "./AddBoardModal";
import TodoDetailModal from "./TodoDetailModal";
import BoardColumn from "./BoardColumn";
import BoardOverlays from "./BoardOverlays";
import { supabase } from "../../lib/supabaseClient";
import { useBoardData } from "../../lib/useBoardData";
import { useDragHandlers } from "../../lib/useDragHandlers";
import type { Todo } from "../../lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default  function Dashboard() {
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const {
    boards,
    todos,
    selectedBoardId,
    setSelectedBoardId,
    checkingAuth,
    todosForBoard,
    addTodo,
    deleteTodo,
    addBoard,
    editing,
    editText,
    setEditing,
    setEditText,
    startEdit,
    saveEdit,
    setBoards,
    setTodos,
    updateTodoDescription,
  } = useBoardData();
  
  const { activeBoard, activeTodo, onDragStart, onDragEnd } = useDragHandlers(
    boards,
    todos,
    setBoards,
    setTodos,
    todosForBoard,
  );

  const [todoText, setTodoText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

  const [showTodoModal, setShowTodoModal] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<null | Todo>(null);
  const [todoDescription, setTodoDescription] = useState("");

  const boardIds = boards.map((b) => `board-${b.id}`);

  if (checkingAuth) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="min-h-screen bg-purple-700 from-blue-100 via-indigo-100 to-purple-100">
        <TodoNavbar
          todoText={todoText}
          onTodoTextChange={setTodoText}
          selectedBoardId={selectedBoardId}
          boards={boards}
          onSelectedBoardChange={setSelectedBoardId}
          onAddTodo={() => {
            addTodo(todoText, selectedBoardId);
            setTodoText("");
         }}
          onAddBoardClick={() => setShowModal(true)}
          onSignOut={async () => {
            await supabase.auth.signOut();
            router.replace("/login");
          }}
        />

        <div className="px-4 sm:px-6 py-6 sm:py-10">
          <SortableContext
            items={boardIds}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-8">
              {boards.map((board) => (
                <BoardColumn
                  key={board.id}
                  board={board}
                  todos={todosForBoard(board.id)}
                  editingTodoId={editing?.todoId ?? null}
                  editText={editText}
                  onStartEdit={startEdit}
                  onSaveEdit={saveEdit}
                  onCancelEdit={() => {
                    setEditing(null);
                    setEditText("");
                  }}
                  onDeleteTodo={deleteTodo}
                  setEditText={setEditText}
                  onTodoClick={(todo) => {
                    setSelectedTodo(todo);
                    setTodoDescription(todo.description ?? "");
                    setShowTodoModal(true);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </div>

        <BoardOverlays
          activeBoard={activeBoard}
          activeTodo={activeTodo}
          todosForBoard={todosForBoard}
        />
        <AddBoardModal
          show={showModal}
          newBoardName={newBoardName}
          onNewBoardNameChange={setNewBoardName}
          onCancel={() => setShowModal(false)}
          onConfirm={() => {
            addBoard(newBoardName);
            setNewBoardName("");
            setShowModal(false);
          }}
        />
        <TodoDetailModal
          show={showTodoModal && selectedTodo !== null}
          todo={selectedTodo}
          description={todoDescription}
          onDescriptionChange={setTodoDescription}
          onCancel={() => setShowTodoModal(false)}
          onSave={async () => {
            if (selectedTodo) {
              await updateTodoDescription(
                selectedTodo.id,
                todoDescription,
              );
              setShowTodoModal(false);
            }
          }}
        />
      </div>
    </DndContext>
  );
};
"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import TodoNavbar from "./components/TodoNavbar";
import AddBoardModal from "./components/AddBoardModal";
import BoardColumn from "./components/BoardColumn";
import BoardOverlays from "./components/BoardOverlays";
import { supabase } from "../lib/supabaseClient";

export type Board = {
  id: number;
  name: string;
  position: number;
  user_id: string;
};

export type Todo = {
  id: number;
  board_id: number;
  content: string;
  position: number;
};

type EditingState = {
  todoId: number;
} | null;

export default function Page() {
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const [boards, setBoards] = useState<Board[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);

  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [todoText, setTodoText] = useState("");

  const [userId, setUserId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [editing, setEditing] = useState<EditingState>(null);
  const [editText, setEditText] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

  const todosForBoard = useCallback(
    (boardId: number) =>
      todos
        .filter((t) => t.board_id === boardId)
        .sort((a, b) => a.position - b.position),
    [todos],
  );

  useEffect(() => {
    let isMounted = true;
    
    const loadForUser = async () => {
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error getting Supabase session:", sessionError);
          if (isMounted) setCheckingAuth(false);
          router.replace("/login");
          return;
        }

        const session = sessionData.session;
        if (!session) {
          if (isMounted) setCheckingAuth(false);
          router.replace("/login");
          return;
        }

        if (!isMounted) return;

        const uid = session.user.id;
        setUserId(uid);

        // Load boards
        const { data: boardRows, error: boardErr } = await supabase
          .from("boards")
          .select("*")
          .eq("user_id", uid)
          .order("position", { ascending: true });

        if (boardErr) {
          console.error("Error loading boards:", boardErr);
          return;
        }

        const loadedBoards: Board[] = boardRows ?? [];
        setBoards(loadedBoards);

        if (loadedBoards.length > 0) {
          setSelectedBoardId(loadedBoards[0].id);

          const boardIds = loadedBoards.map((b) => b.id);
          const { data: todoRows, error: todoErr } = await supabase
            .from("todos")
            .select("*")
            .in("board_id", boardIds)
            .order("position", { ascending: true });

          if (todoErr) {
            console.error("Error loading todos:", todoErr);
          } else {
            setTodos(todoRows ?? []);
          }
        }
      } catch (e) {
        console.error("Unexpected error loading data:", e);
      } finally {
        if (isMounted) {
          setHasLoaded(true);
          setCheckingAuth(false);
        }
      }
    };

    loadForUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const addTodo = async () => {
    if (!todoText.trim() || selectedBoardId === null) return;

    const boardTodos = todosForBoard(selectedBoardId);
    const nextPosition = boardTodos.length > 0
      ? Math.max(...boardTodos.map((t) => t.position)) + 1
      : 0;

    const { data, error } = await supabase
      .from("todos")
      .insert({
        board_id: selectedBoardId,
        content: todoText.trim(),
        position: nextPosition,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding todo:", error);
      return;
    }

    setTodos((prev) => [...prev, data]);
    setTodoText("");
  };

  const deleteTodo = async (todoId: number) => {
    const { error } = await supabase.from("todos").delete().eq("id", todoId);
    if (error) {
      console.error("Error deleting todo:", error);
      return;
    }
    setTodos((prev) => prev.filter((t) => t.id !== todoId));
  };

  const startEdit = (todoId: number, text: string) => {
    setEditing({ todoId });
    setEditText(text);
  };

  const saveEdit = async () => {
    if (!editing || !editText.trim()) return;

    const { error } = await supabase
      .from("todos")
      .update({ content: editText.trim() })
      .eq("id", editing.todoId);

    if (error) {
      console.error("Error updating todo:", error);
      return;
    }

    setTodos((prev) =>
      prev.map((t) =>
        t.id === editing.todoId ? { ...t, content: editText.trim() } : t,
      ),
    );
    setEditing(null);
    setEditText("");
  };

  const addBoard = async () => {
    if (!newBoardName.trim() || !userId) return;

    const nextPosition = boards.length > 0
      ? Math.max(...boards.map((b) => b.position)) + 1
      : 0;

    const { data, error } = await supabase
      .from("boards")
      .insert({
        user_id: userId,
        name: newBoardName.trim(),
        position: nextPosition,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding board:", error);
      return;
    }

    setBoards((prev) => [...prev, data]);
    if (selectedBoardId === null) {
      setSelectedBoardId(data.id);
    }
    setNewBoardName("");
    setShowModal(false);
  };

  const boardIds = boards.map((b) => `board-${b.id}`);

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
          onAddTodo={addTodo}
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
          onConfirm={addBoard}
        />
      </div>
    </DndContext>
  );
}

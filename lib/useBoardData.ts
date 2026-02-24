import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabaseClient";
import type { Board, Todo, EditingState } from "./types";

export function useBoardData() {
  const router = useRouter();

  const [boards, setBoards] = useState<Board[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [editing, setEditing] = useState<EditingState>(null);
  const [editText, setEditText] = useState("");

  const todosForBoard = useCallback(
    (boardId: number) =>
      todos
        .filter((t) => t.board_id === boardId)
        .sort((a, b) => a.position - b.position),
    [todos],
  );

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

  const addTodo = async (text: string, boardId: number | null) => {
    if (!text.trim() || boardId === null) return;

    const boardTodos = todosForBoard(boardId);
    const nextPosition = boardTodos.length > 0
      ? Math.max(...boardTodos.map((t) => t.position)) + 1
      : 0;

    const { data, error } = await supabase
      .from("todos")
      .insert({
        board_id: boardId,
        content: text.trim(),
        position: nextPosition,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding todo:", error);
      return;
    }

    setTodos((prev) => [...prev, data]);
  };

  const deleteTodo = async (todoId: number) => {
    const { error } = await supabase.from("todos").delete().eq("id", todoId);
    if (error) {
      console.error("Error deleting todo:", error);
      return;
    }
    setTodos((prev) => prev.filter((t) => t.id !== todoId));
  };

  const addBoard = async (name: string) => {
    if (!name.trim() || !userId) return;

    const nextPosition = boards.length > 0
      ? Math.max(...boards.map((b) => b.position)) + 1
      : 0;

    const { data, error } = await supabase
      .from("boards")
      .insert({
        user_id: userId,
        name: name.trim(),
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
  };

  return {
    boards,
    todos,
    selectedBoardId,
    setSelectedBoardId,
    userId,
    checkingAuth,
    hasLoaded,
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
  };
}
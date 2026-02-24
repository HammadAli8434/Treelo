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

export type EditingState = {
  todoId: number;
} | null;
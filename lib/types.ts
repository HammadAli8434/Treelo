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
  // optional description for detailed view
  description?: string;
};

export type EditingState = {
  todoId: number;
} | null;
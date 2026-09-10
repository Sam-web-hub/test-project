export const LOCAL_ID_BASE = 256;
export const MAX_TODO_LENGTH = 200;

export interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}
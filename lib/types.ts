export const LOCAL_ID_BASE = 256;
export const MAX_TODO_LENGTH = 200;

// Domain Models
export interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

// Bulk Actions
export type BulkActionType = "delete" | "complete" | "incomplete";

export interface BulkAction {
  action: BulkActionType;
  ids: number[];
}

// Component Props Interfaces
export interface TodoListProps {
  initialTodos?: Todo[];
}

export interface TodoItemProps {
  todo: Todo;
  selected: boolean;
  leaving?: boolean;
  disabled?: boolean;
  onSelect: (id: number, checked: boolean) => void;
  onUpdate: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onProcessingChange?: (id: number, isProcessing: boolean) => void;
}

export interface TodoFormProps {
  onAdd: (todo: Todo) => void;
  disabled?: boolean;
  onCancel?: () => void;
}

export interface BulkActionBarProps {
  count: number;
  isProcessing?: boolean;
  onBulkAction: (action: BulkActionType) => void;
}

export interface BulkActionRunnerProps {
  ids: number[];
  action: BulkActionType;
  onComplete: () => void;
  onProcessed: (id: number) => void;
}
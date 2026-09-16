export type Todo = {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
};

export type BulkKind = "complete" | "incomplete" | "delete";

/** One line of progress emitted by the bulk server action. */
export type BulkUpdate = {
  id: number;
  status: "success" | "failed";
  reason?: string;
};

export type ActionState = {
  ok: boolean;
  /** Present only when ok === false. Rendered next to the input. */
  error?: string;
  /** Bumped on every successful submit so the form knows to reset. */
  nonce?: number;
};
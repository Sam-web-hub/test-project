export const MAX_TODO_LENGTH = 200;

/** Pacing between bulk results, so progress is visible rather than instant. */
export const BULK_PACE_MS = 400;

/** Artificial latency on the initial load, to make the Suspense stream visible.
 *  Set to 0 to see real DummyJSON timing. */
export const SEED_DELAY_MS = 900;

export const DUMMYJSON_URL = "https://dummyjson.com/todos?limit=20";

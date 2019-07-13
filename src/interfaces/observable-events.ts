import { ObservableEvent } from './observer-observable';

/**
 * Library events are all negatives, this way the users can define their own events with positive numbers.
 */
export const MODEL_SYNC: ObservableEvent = -0;
export const MODEL_SAVED: ObservableEvent = -1;
export const MODEL_FETCHED: ObservableEvent = -2;
export const MODEL_DELETED: ObservableEvent = -3;
export const MODEL_ROLLBACK: ObservableEvent = -4;

export type ObservableEvent = number;

export interface Observable {
    fire: (event: ObservableEvent) => void,
    addObserver: (observer: Observer) => boolean,
    observedBy: (observer: Observer) => boolean,
    removeObserver: (observer: Observer) => boolean;
}

export interface Observer {
    notify: (event: ObservableEvent, model: Observable) => void,
}

/**
 * Library events are all negatives, this way the users can define their own events with positive numbers.
 */
export const MODEL_SYNC: ObservableEvent = -0;
export const MODEL_SAVED: ObservableEvent = -1;
export const MODEL_FETCHED: ObservableEvent = -2;
export const MODEL_DELETED: ObservableEvent = -3;
export const MODEL_ROLLBACK: ObservableEvent = -4;

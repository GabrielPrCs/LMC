export type ObservableEvent = number;

export interface Observable {
    fire: (event: ObservableEvent) => void,
    removeObserver: (observer: Observer) => void;
}

export interface Observer {
    notify: (event: ObservableEvent, model: Observable) => void,
}


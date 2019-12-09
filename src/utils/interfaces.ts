
import { AxiosResponse, AxiosError } from "axios";

export type SuccessResponse = AxiosResponse;
export type ErrorResponse = AxiosError;

export type ObservableEvent = string;

export interface Observable {
    fire: (event: ObservableEvent) => void;
    addObserver: (observer: Observer) => void;
    removeObserver: (observer: Observer) => void;
    observedBy: (observer: Observer) => boolean;
}

export interface Observer {
    notify: (event: ObservableEvent, observable: Observable) => void;
}



export interface HttpRoutes {
    [key: string]: string
}

export type HttpError = number;
export type HttpMethod = 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpMethods {
    [key: string]: HttpMethod
}

export type ModelValue = any;

export interface ModelValues {
    [key: string]: ModelValue
};

export interface CollectionValues {

}
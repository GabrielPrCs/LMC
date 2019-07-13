

export interface HttpRoutes {
    
}

export type HttpError = number;
export type HttpMethod = 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpMethods {
    [key: string]: HttpMethod
}

export interface ModelValues {
    id?: number,
    [key: string]: any
};

export interface CollectionValues {

}
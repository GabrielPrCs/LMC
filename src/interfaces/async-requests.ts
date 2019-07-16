export interface ClientRequest {

}

export interface ServerResponseConfig {
    data: string
}

export interface ServerResponse {
    data: object,
    config: ServerResponseConfig
}

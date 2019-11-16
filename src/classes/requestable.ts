import axios from 'axios';
import { Utils } from './utils';
import { SuccessResponse, ErrorResponse } from '../interfaces/async-requests';

export interface ValidationErrors { [key: string]: Array<string> };
export type HttpError = number;
export type HttpMethod = 'POST' | 'post' | 'GET' | 'get' | 'PUT' | 'put' | 'PATCH' | 'patch' | 'DELETE' | 'delete';
export interface HttpMethods { [key: string]: HttpMethod };
export type HttpRoute = string;
export interface HttpRoutes { [key: string]: HttpRoute };

export abstract class Requestable {

    private _loading: boolean = false;
    private _validationErrors: ValidationErrors = {};

    /**
     * A string to be concatened at the beginning of each route.
     */
    basePath(): string {
        return '';
    }

    /**
     * 
     */
    name(): string {
        return Utils.classNameToApiRoute(this.constructor.name);
    }

    /**
     * The error code number returned when the validation of a request's parameters fails.
     */
    validationErrorCode(): HttpError {
        return 422;
    }

    /**
     * 
     */
    protected defaultMethods(): HttpMethods {
        return {
            fetch: 'GET',
            save: 'POST',
            patch: 'PATCH',
            update: 'PUT',
            delete: 'DELETE'
        };
    }

    /**
     * 
     */
    methods(): HttpMethods {
        return {};
    }

    /**
     * 
     */
    protected defaultRoutes(): HttpRoutes {
        return {};
    }


    /**
     */
    routes(): HttpRoutes {
        return {};
    }

    /**
     * 
     */
    get loading(): boolean {
        return this._loading;
    }

    set loading(value: boolean) {
        this._loading = value;
    }

    /**
     * An object with the validation errors from the last request.
     */
    get validationErrors(): ValidationErrors {
        return this._validationErrors;
    }

    set validationErrors(errors: ValidationErrors) {
        this._validationErrors = errors;
    }

    /**
     * Gets the validation errors for a given property. If there are no validation errors for the
     * property, then returns the default value given.
     * 
     * @param property the property to get the validation errors for.
     * @param def the default value to return when there is no validation error.
     */
    errors(property: string, def: Array<string> = []): Array<string> {
        return Utils.getObjectProperty(this.validationErrors, property, def);
    }

    /**
     * Gets the first validation error for a given property. If there are no validation errors for the
     * property, then returns the default value given.
     * 
     * @param property the property to get the validation error for.
     * @param def the default value to return when there is no validation error.
     */
    firstError(property: string, def: string = ""): string {
        return this.errors(property, [def])[0];
    }

    /**
     * 
     */
    mapSuccessResponse(response: SuccessResponse, action: string): SuccessResponse {
        return response;
    }

    /**
     * 
     */
    mapValidationErrors(error: ErrorResponse): ValidationErrors {
        return error.response.data.errors;
    }

    /**
     * 
     */
    mapUnsuccessResponse(error: ErrorResponse, action: string): ErrorResponse {
        return error;
    }

    /**
     * 
     */
    request(action: string, data = {}): Promise<SuccessResponse> {
        if (this.loading) return;

        const routes: HttpRoutes = { ...this.defaultRoutes(), ...this.routes() };
        const methods: HttpMethods = { ...this.defaultMethods(), ...this.methods() };

        if (!routes.hasOwnProperty(action)) throw `The route for the ${action} action does not exists.`;
        if (!methods.hasOwnProperty(action)) throw `The method for the ${action} action does not exists.`;

        const method: HttpMethod = methods[action].toUpperCase() as HttpMethod;
        const url: HttpRoute = this.basePath() + routes[action];

        // Performs the request and return a promise to handle the responses.
        return new Promise<SuccessResponse>((resolve, reject) => {
            const success = (response: SuccessResponse) => {
                this.loading = false
                resolve(this.mapSuccessResponse(response, action));
            };

            const error = (error: ErrorResponse) => {
                this.loading = false
                if (this.validationErrorCode() == error.response.status) this.validationErrors = this.mapValidationErrors(error);
                reject(this.mapUnsuccessResponse(error, action));
            };

            this.loading = true;

            this.validationErrors = {};

            axios({ method, url, [['PUT', 'POST', 'PATCH'].includes(method) ? 'data' : 'params']: data }).then(success).catch(error);
        });
    }
}
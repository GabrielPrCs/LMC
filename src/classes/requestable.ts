import axios from 'axios';
import { Utils } from '../utils/methods';
import { SuccessResponse, ErrorResponse } from '../utils/interfaces';

export interface ValidationErrors { [key: string]: Array<string> };
export type HttpError = number;
export type HttpMethod = 'POST' | 'post' | 'GET' | 'get' | 'PUT' | 'put' | 'PATCH' | 'patch' | 'DELETE' | 'delete';
export interface HttpMethods { [key: string]: HttpMethod };
export type HttpRoute = string;
export interface HttpRoutes { [key: string]: HttpRoute };

/**
 * 
 */
export abstract class Requestable {
    private _loading: boolean = false;
    private _validationErrors: ValidationErrors = {};

    /**
     * 
     */
    name(): string {
        return Utils.classNameToApiRoute(this.constructor.name);
    }

    /**
     * By default, all routes are relative to the root. Here we can define a different relative start if needed.
     * 
     * @returns A string to be concatened at the beginning of each route. 
     */
    basePath(): string {
        return '';
    }

    /**
     * The HTTP methods to perform each action of the CRUD. By default uses the same methods for each action than Laravel does.
     * 
     * @returns An object where each key is an action and the value associated with it is the HTTP method for this action.
     */
    protected defaultMethods(): HttpMethods {
        return { fetch: 'GET', save: 'POST', patch: 'PATCH', update: 'PUT', delete: 'DELETE' };
    }

    /**
     * If the HTTP methods defined at {@link Requestable.defaultMethods | defaultMethods() method} dont't meet our needs,
     * we can redefine one or more of them here. Even, we can create new actions with it owns HTTP methods. By default,
     * no action is redifined.
     * 
     * Actions that we do not redefine will use the default methods.
     * 
     * @returns An object where each key is an action and the value associated with it is the HTTP method for this action.
     */
    methods(): HttpMethods {
        return {};
    }

    /**
     * Merges the HTTP methods from {@link Requestable.defaultMethods | defaultMethods() method} with the ones
     * from {@link Requestable.methods | methods() method}, giving priority to the latter ones.
     * 
     * @returns An object where each key is an action and the value associated with it is the HTTP method for this action.
     */
    private get mergedMethods(): HttpMethods {
        return { ...this.defaultMethods(), ...this.methods() };
    }

    /**
     * The backend routes to perform each action of the CRUD. By default it's empty.
     * 
     * @returns An object where each key is an action and the value associated with it is the backend route for this action.
     */
    protected defaultRoutes(): HttpRoutes {
        return {};
    }

    /**
     * If the routes defined at {@link Requestable.defaultRoutes | defaultRoutes() method} dont't meet our needs,
     * we can redefine one or more of them here. Even, we can create new actions with it owns backend routes. By default,
     * no action is redifined.
     * 
     * Actions that we do not redefine will use the default routes.
     * 
     * @returns An object where each key is an action and the value associated with it is the backend route for this action.
     */
    routes(): HttpRoutes {
        return {};
    }

    /**
     * Merges the backend routes from {@link Requestable.defaultRoutes | defaultRoutes() method} with the ones
     * from {@link Requestable.routes | routes() method}, giving priority to the latter ones.
     * 
     * @returns An object where each key is an action and the value associated with it is the backend route for this action.
     */
    private get mergedRoutes(): HttpRoutes {
        return { ...this.defaultRoutes(), ...this.routes() };
    }

    /**
     * A boolean that determines if a request is being performed at the moment.
     */
    get loading(): boolean { return this._loading }
    set loading(value: boolean) { this._loading = value }

    /**
     * The error code number returned when the validation of a request fails. By default, Laravel uses the error code 422.
     */
    get validationErrorCode(): HttpError { return 422 }

    /**
     * An object with the validation errors from the last request.
     * If the last request returned successfully, the object will be empty.
     */
    get validationErrors(): ValidationErrors { return this._validationErrors }
    set validationErrors(errors: ValidationErrors) { this._validationErrors = this.mapValidationErrors(errors) }

    /**
     * Gets the validation errors for a given property. If there are no validation errors for the
     * property, then returns the default value given.
     * 
     * @param property - The property to get the validation errors for.
     * @param def - The default value to return when there is no validation error.
     * @returns An array with the validation errors for the given property.
     */
    errors(property: string, def: Array<string> = []): Array<string> {
        return Utils.getObjectProperty(this.validationErrors, property, def);
    }

    /**
     * Gets the first validation error for a given property. If there are no validation errors for the
     * property, then returns the default value given.
     * 
     * @param property - The property to get the validation error for.
     * @param def - The default value to return when there is no validation error.
     * @returns A string with the first validation error for the given property.
     */
    firstError(property: string, def: string = ""): string {
        return this.errors(property, [def])[0];
    }

    /**
     * Method that is called when a request ends successfully. Receives the request's response
     * and a string with the name of the action that triggered the request. Can be used to change
     * the response if needed.
     * 
     * Has to return a SuccessResponse, which will be used onwards. By default, returns the same
     * response that the server returned.
     * 
     * @param response - The server's success response.
     * @param action - The action that triggered the response.
     * @returns The changed success response.
     */
    mapSuccessResponse(response: SuccessResponse, action: string): SuccessResponse {
        return response;
    }

    /**
     * Method that is called when a request ends with an error. Receives the request's error response
     * and a string with the name of the action that triggered the request. Can be used to change
     * the error if needed.
     * 
     * Has to return an ErrorResponse, which will be used onwards. By default, returns the same
     * error that the server returned.
     * 
     * @param error - The server's error response.
     * @param action - The action that triggered the error.
     * @returns The changed error response.
     */
    mapErrorResponse(error: ErrorResponse, action: string): ErrorResponse {
        return error;
    }

    /**
     * Method that is called when a request ends with a validation error.
     * 
     * Has to return a ValidationError object, which will be assigned to the {@link Requestable.validationErrors | validationErrors property}.
     * By default, returns the Laravel's validation error object, which is stored at 'error.response.data.errors'.
     * 
     * @param errors - The server's validation errors.
     * @returns The mapped validation errors.
     */
    mapValidationErrors(errors: ValidationErrors): ValidationErrors {
        return errors;
    }

    /**
     * Performs an AJAX request with the given action and data. The route and HTTP method are obtained
     * from the {@link Requestable.mergedRoutes | mergedRoutes() method} and {@link Requestable.mergedMethods | mergedMethods() method}
     * respectively.
     * 
     * At the beginning, sets the {@link Requestable.loading | loading property} to true.
     * 
     * When the request is completed, calls the {@link Requestable.mapSuccessResponse | mapSuccessResponse() method} if the request
     * was successfull or {@link Requestable.mapErrorResponse | mapErrorResponse() method} if the request returned with an error.
     * 
     * Finally, sets the {@link Requestable.loading | loading property} to false.
     * 
     * @param action - A string with the name of the action to perform.
     * @param data - An object with the data to send in the AJAX request.
     * @returns A promise that will be completed when the AJAX request is finished.
     */
    request(action: string, data = {}): Promise<SuccessResponse> {
        if (this.loading) return;

        const routes: HttpRoutes = this.mergedRoutes;
        const methods: HttpMethods = this.mergedMethods;

        if (!routes.hasOwnProperty(action)) throw `The route for the '${action}' action does not exists.`;
        if (!methods.hasOwnProperty(action)) throw `The method for the '${action}' action does not exists.`;

        const method: HttpMethod = methods[action].toUpperCase() as HttpMethod;
        const url: HttpRoute = this.basePath() + routes[action];

        return new Promise<SuccessResponse>((resolve, reject) => {
            const success = (response: SuccessResponse) => {
                this.loading = false
                resolve(this.mapSuccessResponse(response, action));
            };

            const error = (error: ErrorResponse) => {
                this.loading = false
                if (this.validationErrorCode == error.response.status) this.validationErrors = error.response.data.errors;
                reject(this.mapErrorResponse(error, action));
            };

            this.loading = true;

            this.validationErrors = {};

            axios({ method, url, [['PUT', 'POST', 'PATCH'].includes(method) ? 'data' : 'params']: data }).then(success).catch(error);
        });
    }
}
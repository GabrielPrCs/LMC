import axios from 'axios';
import { Utils } from './utils';
import { HttpError, HttpRoutes, HttpMethods } from '../interfaces/data-types';
import { SuccessResponse, ErrorResponse } from '../interfaces/async-requests';

export abstract class Requestable {
    private _loading: boolean;

    constructor() {
        this._loading = false;
    }

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
            save: 'POST',
            fetch: 'GET',
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
     * 
     * @param routes 
     */
    protected routesFormater(routes: HttpRoutes): HttpRoutes {
        return routes;
    }

    /**
     * 
     */
    protected successInterceptor(action: string, response: SuccessResponse): SuccessResponse {
        return response;
    }

    /**
     * 
     */
    protected errorInterceptor(action: string, error: ErrorResponse): ErrorResponse {
        return error;
    }

    /**
     * The routes for this model. If not is overridden, then returns the defaults.
     */
    routes(): HttpRoutes {
        return {};
    }

    get loading(): boolean {
        return this._loading;
    }

    set loading(value: boolean) {
        this._loading = value;
    }

    /**
     * 
     */
    request(action: string, data = {}) {
        const routes: HttpRoutes = this.routesFormater({ ...this.defaultRoutes(), ...this.routes() });
        const methods: HttpMethods = { ...this.defaultMethods(), ...this.methods() };

        if (!routes.hasOwnProperty(action)) throw `The route for the ${action} action does not exists.`;
        if (!methods.hasOwnProperty(action)) throw `The method for the ${action} action does not exists.`;

        const method = methods[action];
        const url = this.basePath() + routes[action];
        const extraConfig = {};

        if (['PUT', 'POST', 'PATCH'].includes(method)) extraConfig['data'] = data;
        else extraConfig['params'] = data;

        // Performs the request and return a promise to handle the responses.
        return new Promise((resolve, reject) => {
            const clear = () => this.loading = false;

            const success = (response: SuccessResponse) => {
                clear();
                resolve(this.successInterceptor(action, response));
            };

            const error = (error: ErrorResponse) => {
                clear();
                reject(this.errorInterceptor(action, error));
            };

            this.loading = true;

            axios({ method, url, ...extraConfig }).then(success).catch(error);
        });
    }
}
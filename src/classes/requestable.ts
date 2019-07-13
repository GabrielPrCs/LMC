import axios from 'axios';
import { Utils } from './utils';

export abstract class Requestable {
    private _loading: boolean;

    constructor() {
        this._loading = false;
    }
    
    /**
     * A string to be concatened at the beginning of each route.
     */
    basePath() {
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
    validationErrorCode(): number {
        return 422;
    }

    /**
     * 
     */
    protected defaultMethods() {
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
    methods() {
        return {};
    }

    /**
     * 
     */
    protected defaultRoutes() {
        return {};
    }

    /**
     * The routes for this model. If not is overridden, then returns the defaults.
     */
    routes() {
        return {};
    }

    get loading() {
        return this._loading;
    }

    set loading(value) {
        this._loading = value;
    }

    /**
     * 
     */
    request(action, data = {}) {
        const routes = { ...this.defaultRoutes(), ...this.routes() };

        const methods = { ...this.defaultMethods(), ...this.methods() };

        if (!routes.hasOwnProperty(action)) throw `The route for the ${action} action does not exists.`;
        if (!methods.hasOwnProperty(action)) throw `The method for the ${action} action does not exists.`;

        const method = methods[action];

        const extraConfig = {};

        if (['PUT', 'POST', 'PATCH'].includes(method)) extraConfig['data'] = data;
        else extraConfig['params'] = data;

        const config = {
            method,
            url: this.basePath() + routes[action],
            ...extraConfig
        };

        return new Promise((resolve, reject) => {
            const clear = () => this.loading = false;

            const success = response => {
                clear();
                resolve(response);
            };

            const error = error => {
                clear();
                reject(error);
            };

            this.loading = true;

            axios(config).then(success).catch(error);
        });
    }
}
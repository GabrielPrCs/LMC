const Data = require('./data.js');
const axios = require('axios');
const pluralize = require('pluralize');
const _ = require('lodash');

module.exports = class Model {

    constructor(values, config = {}) {
        this._loading = false;
        this._values = new Data(values);
        this._syncValues = new Data(values);

        /**
         * Extra configuration
         */
        this._name = config.hasOwnProperty('name') ? config.name : pluralize(this.constructor.name).toLowerCase();
    }

    get values() {
        return this._values.values;
    }

    set values(values) {
        this._values.values = { ...values };
    }

    get syncValues() {
        return this._syncValues.values;
    }

    set syncValues(values) {
        this._syncValues.values = { ...values };
    }

    get loading() {
        return this._loading;
    }

    set loading(value) {
        this._loading = value;
    }

    get name() {
        return this._name;
    }

    /**
     * Determines which property of the model's values will be used as the primary key.
     */
    key() {
        return 'id';
    }

    /**
     * 
     */
    get id() {
        return this.values[this.key()];
    }

    /**
     * 
     */
    defaults() {
        return {
            id: null
        };
    }

    /**
     * Returns the model's values object to the last sync status. The current values object is lost.
     */
    rollback() {
        this.values = { ...this.syncValues };
    }

    /**
     * Sets the sync object to the current model's values object. The previous sync status is lost.
     */
    sync() {
        this.syncValues = { ...this.values };
    }

    /**
     * Sets the model's values object to it's defaults values.
     */
    clear() {
        this.values = this.defaults(); // As defaults() returns a new object each time, we don't need to user { ...this.defaults() }.
    }

    /**
     * Determines if the model's values has changed since the last call of sync method.
     */
    get dirty() {
        return !_.isEqual(this.values, this.syncValues);
    }

    /**
     * 
     */
    defaultMethods() {
        return {
            fetch: 'GET',
            save: 'POST',
            update: 'PATCH',
            delete: 'DELETE'
        };
    }

    /**
     * 
     */
    methods() {
        return this.defaultMethods();
    }

    /**
     * 
     */
    defaultResponseCodes() {
        return {
            success: 200,
            notFound: 404,
            validationError: 422,
            internalServerError: 500
        };
    }

    /**
     * 
     */
    responseCodes() {
        return this.defaultResponseCodes();
    }

    /**
     * 
     */
    defaultRoutes() {
        return {
            fetch: `/${this.name}/{id}`,
            save: `/${this.name}`,
            update: `/${this.name}/{id}`,
            delete: `/${this.name}/{id}`
        };
    }

    /**
     * 
     */
    routes() {
        return this.defaultRoutes();
    }

    /**
     * 
     */
    basePath() {
        return '';
    }

    /**
     * 
     */
    axiosConfigFor(action) {
        const routes = {
            ...this.defaultRoutes(),
            ...this.routes()
        };

        const methods = {
            ...this.defaultMethods(),
            ...this.methods()
        };

        if (!routes.hasOwnProperty(action)) throw `The route for the ${action} action does not exists.`;
        if (!methods.hasOwnProperty(action)) throw `The method for the ${action} action does not exists.`;

        return {
            method: methods[action],
            url: this.basePath() + routes[action].replace('{id}', this.id)
        };
    }

    /**
     * 
     */
    async fetch() {
        let config;

        try {
            config = this.axiosConfigFor('fetch');
        }
        catch(e) {
            throw e;
        }

        return new Promise((resolve, reject) => {
            const clear = x => this.loading = false;

            const success = response => {
                this.values = response.data;
                this.sync();

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

    /**
     * 
     */
    async save() {
        let route = this.values.id ? this.routes().update : this.routes().save;

        return route;
    }

    /**
     * 
     */
    async delete() {
        let route = this.routes().delete;

        return route;
    }
};
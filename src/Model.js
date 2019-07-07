const Data = require('./Data.js');
const axios = require('axios');
const pluralize = require('pluralize');

module.exports = class Model {

    constructor(values, config = {}) {
        this._loading = false;
        this._values = new Data(values);
        this._syncValues = new Data(values);

        /**
         * Extra configuration
         */
        this._name = config.hasOwnProperty('name') ? config.name : pluralize(this.constructor.name).toLowerCase();
        this._basePath = config.hasOwnProperty('basePath') ? config.basePath : '';
    }

    get values() {
        return this._values.values;
    }

    set values(values) {
        this._values.values = values;
    }

    get syncValues() {
        return this._syncValues.values;
    }

    set syncValues(values) {
        this._syncValues.values = values;
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
    defaults() {
        return {
            id: null
        };
    }

    /**
     * Returns the model's values object to the last sync status. The current values object is lost.
     */
    rollback() {
        this.values = this.syncValues;
    }

    /**
     * Sets the sync object to the current model's values object. The previous sync status is lost.
     */
    sync() {
        this.syncValues = this.values;
    }

    /**
     * Sets the model's values object to it's defaults values.
     */
    clear() {
        this.values = this.defaults();
    }

    /**
     * 
     */
    methods() {
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
    responseCodes() {
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
    routes() {
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
    composeRoute(route) {
        const routes = this.routes();

        let plainRoute = routes.hasOwnProperty(route) ? routes[route] : '';

        return this._basePath + plainRoute.replace('{id}', this.values[this.key()]);
    }

    /**
     * 
     */
    fetch() {
        return new Promise((resolve, reject) => {

            const config = {
                method: this.methods().fetch,
                url: this.composeRoute('fetch')
            };

            const clear = x => this.loading = false;

            const success = response => {
                this.values = response.data;

                clear();
                resolve();
            };

            const error = error => {
                // clear();
                // reject();
            };

            this.loading = true;

            axios(config).then(success).catch(error);
        });
    }

    /**
     * 
     */
    save() {
        let route = this.values.id ? this.routes().update : this.routes().save;

        return route;
    }

    /**
     * 
     */
    delete() {
        let route = this.routes().delete;

        return route;
    }
};
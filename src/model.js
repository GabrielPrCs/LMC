const Data = require('./data.js');
const Requestable = require('./requestable');
const pluralize = require('pluralize');
const _ = require('lodash');

const {
    MODEL
} = require('./events');

module.exports = class Model extends Requestable {

    constructor(values, collection = null) {
        super();

        this._values = new Data({
            ...this.defaults(),
            ...values
        });

        this._syncValues = new Data({
            ...this.defaults(),
            ...values
        });

        this._observers = [];

        if (collection != null) collection.add(this);
    }

    /**
     * 
     */
    addObserver(observer) {
        if (typeof observer.notify !== 'function') throw "The observer has to implement the notify function.";

        if (_.findIndex(this._observers, observer) < 0) this._observers.push(observer);
    }

    /**
     * 
     */
    removeObserver(filter) {
        _.remove(this._observers, filter);
    }

    /**
     * 
     */
    fire(event) {
        this._observers.forEach(observer => observer.notify(event, this));
    }

    get values() {
        return this._values.values;
    }

    set values(values) {
        this._values.values = {
            ...this.defaults(),
            ...values
        };
    }

    get syncValues() {
        return this._syncValues.values;
    }

    set syncValues(values) {
        this._syncValues.values = {
            ...this.defaults(),
            ...values
        };
    }

    /**
     * 
     */
    get id() {
        return this.values[Model.key()];
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
    name() {
        return pluralize(this.constructor.name.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-')).toLowerCase();
    }

    /**
     * Determines which property of the model's values will be used as the primary key.
     */
    static key() {
        return 'id';
    }

    /**
     * The defaults values for each one of the model properties.
     */
    defaults() {
        return {
            id: null
        };
    }

    /**
     * 
     */
    defaultRoutes() {
        return {
            save: `/${this.name()}`,
            fetch: `/${this.name()}/${this.id}`,
            update: `/${this.name()}/${this.id}`,
            delete: `/${this.name()}/${this.id}`
        };
    }

    /**
     * Returns the model's values object to the last sync status. The current values object is lost.
     */
    rollback() {
        this.values = this.syncValues;
        this.fire(MODEL.ROLLBACK);
    }

    /**
     * Sets the sync object to the current model's values object. The previous sync status is lost.
     */
    sync() {
        this.syncValues = this.values;
        this.fire(MODEL.SYNC);
    }

    /**
     * Sets the model's values object to it's defaults values.
     */
    clear() {
        this.values = this.defaults(); // As defaults() returns a new object each time, we don't need to use { ...this.defaults() }.
    }

    /**
     * 
     */
    async fetch() {
        return new Promise((resolve, reject) => {

            const success = response => {

                this.values = response.data;

                this.sync();

                this.fire(MODEL.FETCHED);

                resolve(response);
            };

            try {
                this.requester('fetch').then(success).catch(error => reject(error));
            } catch (e) {
                throw e;
            }
        });
    }

    /**
     * 
     */
    async save() {
        let route = this.values.id ? this.routes().update : this.routes().save;

        this.fire(MODEL.SAVED);

        return route;
    }

    /**
     * 
     */
    async delete() {
        let route = this.routes().delete;

        this.fire(MODEL.DELETED);

        return route;
    }
};
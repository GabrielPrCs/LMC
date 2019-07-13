const Data = require('./data.js');
const Requestable = require('./requestable');
const pluralize = require('pluralize');
const _ = require('lodash');

const {
    MODEL
} = require('./events');

module.exports = class Model extends Requestable {
    /**
     * Data     _values
     * Data     _syncValues
     * Boolean  _deleted
     * Array    _observers
     */
    constructor(values = {}, collection = null) {
        super();

        this._values = new Data({
            ...this.defaults(),
            ...values
        });

        this._syncValues = new Data({
            ...this.defaults(),
            ...values
        });

        this._deleted = false;

        this._observers = [];

        if (collection != null) collection.add(this);
    }

    /**
     * Generates a name for the model. The name will be the model's class name, in plural and lowercase.
     * The name will be used to generate the dafault routes for the model.
     */
    name() {
        return pluralize(this.constructor.name.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-')).toLowerCase();
    }

    /**
     * 
     */
    plainJS() {
        return this.values;
    }

    /**
     * Adds an observer that will be notified when an event is fired. The observer must implement a notify function.
     */
    addObserver(observer) {
        if (typeof observer.notify !== 'function') throw "The observer has to implement the notify function.";

        if (_.findIndex(this._observers, observer) < 0) this._observers.push(observer);
    }

    /**
     * Removes the observer that matches with the filter criteria from the list of observers.
     */
    removeObserver(filter) {
        _.remove(this._observers, filter);
    }

    /**
     * Notifies to each observer that a event has happened.
     */
    fire(event) {
        this._observers.forEach(observer => observer.notify(event, this));
    }

    /**
     * Determines if the model has been successfully deleted from the backend.
     */
    get deleted() {
        return this._deleted;
    }

    set deleted(value) {
        this._deleted = value;
    }

    /**
     * The current status of the model.
     */
    get values() {
        return this._values.values;
    }

    set values(values) {
        this._values.values = {
            ...this.defaults(),
            ...values
        };
    }

    /**
     * The last synchronized status of the model.
     */
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
     * The values that have changed since the last call of the sync method.
     */
    get dirtyValues() {
        function changes(object, base) {
            return _.transform(object, function (result, value, key) {
                if (!_.isEqual(value, base[key])) {
                    result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
                }
            });
        }

        return changes(this.values, this.syncValues);
    }

    /**
     * Determines if the model's values has changed since the last call of sync method.
     */
    get dirty() {
        return !_.isEqual(this.dirtyValues, {});
    }

    /**
     * Determines which property of the model's values will be used as the primary key.
     */
    static key() {
        return 'id';
    }

    /**
     * 
     */
    get id() {
        return this.values[Model.key()];
    }

    /**
     * 
     */
    set id(value) {
        this.values[Model.key()] = value;
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
            patch: `/${this.name()}/${this.id}`,
            update: `/${this.name()}/${this.id}`,
            delete: `/${this.name()}/${this.id}`
        };
    }

    /**
     * Determines if the update request will be performed using PUT or PATCH.
     */
    patchUpdates() {
        return false;
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
     * Fires the MODEL.FETCHED event on success.
     */
    async fetch() {
        return new Promise((resolve, reject) => {
            const success = response => {
                this.values = response.data;

                this.sync();

                this.fire(MODEL.FETCHED);

                resolve(response);
            };

            this.request('fetch').then(success).catch(reject);
        });
    }

    /**
     * Fires the MODEL.SAVED event on success.
     */
    async save() {
        return new Promise((resolve, reject) => {
            const success = response => {
                /**
                 * If the response changes the id of the object for some reason, then updates it.
                 * This should only happen when the model is saved for the first time on the server.
                 */
                if (this.id != response.data[Model.key()]) this.id = response.data[Model.key()];

                this.deleted = false;

                this.sync();

                this.fire(MODEL.SAVED);

                resolve(response);
            };

            let action = this.values.id ? (this.patchUpdates() ? 'patch' : 'update') : 'save';

            let data = action == 'patch' ? this.dirtyValues : this.values;

            this.request(action, data).then(success).catch(reject);
        });
    }

    /**
     * Deletes the model from the backend. The values of the model are not changed, so they can still be accessed.
     * If the backend uses soft deletion, this values (including the id) can be used to restore the data.
     * 
     * Fires the MODEL.DELETED event on success.
     */
    async delete() {
        return new Promise((resolve, reject) => {
            const success = response => {
                this.deleted = true;
                this.fire(MODEL.DELETED);
                resolve(response);
            };

            this.request('delete').then(success).catch(reject);
        });
    }
};
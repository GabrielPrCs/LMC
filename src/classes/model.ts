import { Utils } from './utils';
import { Requestable } from './requestable';
import { MODEL_ROLLBACK, MODEL_SYNC, MODEL_FETCHED, MODEL_SAVED, MODEL_DELETED } from './events';
import { Collection } from './collection';
import { ObservableEvent, Observer, Observable } from '../interfaces/observer-observable';

interface ModelValues {
    id?: number,
    [key: string]: any
};

export abstract class Model extends Requestable implements Observable {

    private _values: ModelValues;
    private _syncValues: ModelValues;
    private _deleted: boolean = false;
    private _observers: Array<Observer> = [];

    constructor(values: ModelValues = {}, collection?: Collection) {
        super();

        this.values = values;

        this.syncValues = values;

        if (collection) collection.add(this);
    }

    /**
     * 
     */
    plainJS() {
        return this.values;
    }

    /**
     * Adds an observer that will be notified when an event is fired.
     */
    addObserver(observer: Observer) {
        if (Utils.inArray(this._observers, observer)) this._observers.push(observer);
    }

    /**
     * Removes the observer that matches with the filter criteria from the list of observers.
     */
    removeObserver(observer: Observer) {
        Utils.remove(this._observers, observer);
    }

    /**
     * Notifies to each observer that a event has happened.
     */
    fire(event: ObservableEvent) {
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
        return this._values;
    }

    set values(values) {
        this._values = { ...this.defaults(), ...this.values, ...values };
    }

    /**
     * The last synchronized status of the model.
     */
    get syncValues() {
        return this._syncValues;
    }

    set syncValues(values) {
        this._syncValues = { ...this.defaults(), ...this.syncValues, ...values };
    }

    /**
     * The values that have changed since the last call of the sync method.
     */
    get dirtyValues() {
        return Utils.objectDiff(this.values, this.syncValues);
    }

    /**
     * Determines if the model's values has changed since the last call of sync method.
     */
    get dirty() {
        return !Utils.isEqual(this.dirtyValues, {});
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
    protected defaultRoutes() {
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
        this.fire(MODEL_ROLLBACK);
    }

    /**
     * Sets the sync object to the current model's values object. The previous sync status is lost.
     */
    sync() {
        this.syncValues = this.values;
        this.fire(MODEL_SYNC);
    }

    /**
     * Sets the model's values object to it's defaults values.
     */
    clear() {
        this.values = this.defaults(); // As defaults() returns a new object each time, we don't need to use { ...this.defaults() }.
    }

    /**
     * Fires the MODEL_FETCHED event on success.
     */
    async fetch() {
        return new Promise((resolve, reject) => {
            const success = response => {
                this.values = response.data;

                this.sync();

                this.fire(MODEL_FETCHED);

                resolve(response);
            };

            this.request('fetch').then(success).catch(reject);
        });
    }

    /**
     * Fires the MODEL_SAVED event on success.
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

                this.fire(MODEL_SAVED);

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
     * Fires the MODEL_DELETED event on success.
     */
    async delete() {
        return new Promise((resolve, reject) => {
            const success = response => {
                this.deleted = true;
                this.fire(MODEL_DELETED);
                resolve(response);
            };

            this.request('delete').then(success).catch(reject);
        });
    }
};
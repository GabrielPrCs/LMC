import { Utils } from './utils';
import { Requestable } from './requestable';
import { Collection } from './collection';
import { ObservableEvent, Observer, Observable, MODEL_ROLLBACK, MODEL_SYNC, MODEL_FETCHED, MODEL_SAVED, MODEL_DELETED } from '../interfaces/observer-observable';
import { ModelValue, ModelValues } from '../interfaces/data-types';
import { SuccessResponse, ErrorResponse } from '../interfaces/async-requests';
import { HttpRoutes } from '../interfaces/data-types';

export abstract class Model extends Requestable implements Observable {

    private _values: ModelValues = {};
    private _syncValues: ModelValues = {};
    private _deleted: boolean = false;
    private _observers: Array<Observer> = [];
    private _validationErrors;

    /**
     * Creates a new instance of the model.
     * 
     * The initial status will be merged to the default values, **giving priority to the passed values over the default ones**.
     * For this reason, is not necessary to pass the values of those properties that will have the default value. If no id
     * is provided on the initial values, the model will considered as a new model that has not been persisted on backend yet (model.id == null).
     *
     * The model will be added to each one of the collections passed.
     * 
     * @param values the initial status of the model.
     * @param collection an array of the collections to where the model has to be added.
     */
    constructor(values: ModelValues = {}, collections: Array<Collection> = []) {
        super();

        this.values = values;

        this.validationErrors = {};

        this.sync();

        this.addTo(collections);
    }

    /**
     * The current status of the model.
     */
    get values(): ModelValues {
        return this._values;
    }

    set values(values: ModelValues) {
        this._values = { ...this.defaults(), ...this.values, ...values };
    }

    /**
     * The last synchronized status of the model.
     */
    get syncValues(): ModelValues {
        return this._syncValues;
    }

    /**
     * The values that have changed since the last call of the sync method.
     */
    get dirtyValues(): ModelValues {
        return Utils.objectDiff(this.values, this.syncValues);
    }

    /**
     * Determines if the model's values has changed since the last call of sync method.
     */
    get dirty(): boolean {
        return !Utils.isEqual(this.dirtyValues, {});
    }

    /**
     * Determines if the model has been successfully deleted from the backend.
     */
    get deleted(): boolean {
        return this._deleted;
    }

    /**
     * 
     */
    get validationErrors() {
        return this._validationErrors;
    }

    set validationErrors(errors) {
        this._validationErrors = errors;
    }

    /**
     * 
     * @param property 
     * @param def
     */
    get(property: string, def: ModelValue = undefined): ModelValue {
        return Utils.getObjectProperty(this.values, property, def);
    }

    /**
     * 
     * @param property 
     * @param value 
     */
    set(property: string, value: ModelValue): void {
        Utils.setObjectProperty(this.values, property, value);
    }

    /**
     * 
     * @param property 
     */
    remove(property: string): void {

    }

    /**
     * Gets the validation errors for a given property. If there are no validation errors for the
     * property, then returns the default value given.
     * 
     * @param property the property to get the validation errors for.
     * @param def the default value to return when there is no validation error.
     */
    errors(property: string, def: string | Array<string> = []): string | Array<string> {
        return Utils.getObjectProperty(this.validationErrors, property, def);
    }

    /**
     * Determines if the given observer already exists on the array of observers.
     * 
     * @param observer  the observer to check if is present.
     * @return true if the observer is present, false otherwise.
     */
    observedBy(observer: Observer): boolean {
        return Utils.inArray(this._observers, observer);
    }

    /**
     * **[Chainable]**
     * Adds an observer that will be notified when an event is fired. When an observer is notified,
     * the notify function will be called with the event that is beeing fired and the instance of the model
     * that fired the event.
     * 
     * If the observer already exists in the array of observers, then does nothing.
     * 
     * @param observer the observer to be added to the array of observers.
     * @returns the instance of the model for method chaining.
     */
    addObserver(observer: Observer): this {
        if (!this.observedBy(observer)) this._observers.push(observer);
        return this;
    }

    /**
     * **[Chainable]**
     * Removes the given observer from the array of observers. If the observer was not in the array, then does nothing.
     * 
     * If the observer is as collection, also removes the model from the collection.
     * 
     * @param observer the observer to be removed from the list of observers.
     * @returns the instance of the model for method chaining.
     */
    removeObserver(observer: Observer): this {
        if (this.observedBy(observer)) Utils.remove(this._observers, observer);
        return this;
    }

    /**
     * Notifies to each observer that an event has happened. Sends the event and the model that has fired the event
     * to the observer.
     * 
     * @param event the event to notify.
     */
    fire(event: ObservableEvent): void {
        this._observers.forEach(observer => observer.notify(event, this));
    }

    /**
     * The defaults values for each one of the model properties.
     * 
     * @returns an ModelValues object with the status of a model that does not exists on backend yet.
     */
    defaults(): ModelValues {
        return {};
    }

    /**
     * Generates an unique id for the model using its values.
     */
    key(): any {
        return this.values.id;
    }

    /**
     * Determines if the update request will be performed using PUT or PATCH.
     */
    patchUpdates(): boolean {
        return false;
    }

    /**
     * 
     */
    protected defaultRoutes(): HttpRoutes {
        return {
            save: '/{name}',
            fetch: '/{name}/{key}',
            patch: '/{name}/{key}',
            update: '/{name}/{key}',
            delete: '/{name}/{key}'
        };
    }

    /**
     * Given a set of routes, does the following replacements:
     * 
     * {key}  --> model.key()
     * {name} --> model.name()
     * 
     * @param routes the object that contains the routes to give format.
     * @return the formated routes.
     */
    protected routesFormater(routes: HttpRoutes): HttpRoutes {
        let forRoutes = { ...routes };

        for (var key in routes) if (routes.hasOwnProperty(key))
            forRoutes[key] = routes[key].replace('{name}', this.name()).replace('{key}', this.key());

        return forRoutes;
    }

    /**
     * **[Chainable]**
     * Returns the model's values object to the last sync status. The current values object is lost.
     * 
     * @returns the instance of the model for method chaining.
     */
    rollback(): this {
        this.values = this.syncValues;
        this.fire(MODEL_ROLLBACK);
        return this;
    }

    /**
     * **[Chainable]**
     * Sets the sync object to the current model's values object. The previous sync status is lost.
     * 
     * @returns the instance of the model for method chaining.
     */
    sync(): this {
        this._syncValues = { ...this.defaults(), ...this.syncValues, ...this.values };
        this.fire(MODEL_SYNC);
        return this;
    }

    /**
     * **[Chainable]**
     * Sets the model's values object to it's defaults values.
     * 
     * @returns the instance of the model for method chaining.
     */
    clear(): this {
        this.values = this.defaults(); // As defaults() returns a new object each time, we don't need to use { ...this.defaults() }.
        return this;
    }

    /**
     * **[Chainable]**
     * Adds the model to one or more collections. This will have the same result than calling collection.add(model) on each
     * one of the collections.
     * 
     * @param col the collection or an array with the collections to where add the model.
     * @returns the instance of the model for method chaining.
     */
    addTo(col: Collection | Array<Collection>): this {
        const handler = (collection: Collection) => {
            if (!collection.contains(this)) collection.add(this);
        };

        if (col instanceof Collection) handler(col);
        else col.forEach(collection => handler(collection));
        return this;
    }

    /**
     * **[Chainable]**
     * Removes the model from one or more collections. This will have the same result than calling collection.remove(model) on each
     * one of the collections.
     * 
     * @param col the collection or an array with the collections from where remove the model.
     * @returns the instance of the model for method chaining.
     */
    removeFrom(col: Collection | Array<Collection>): this {
        if (col instanceof Collection) col.remove(this);
        else col.forEach(collection => collection.remove(this));
        return this;
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
    mapSaveValues(values: ModelValue, action: string): ModelValues {
        return values;
    }

    /**
     * Fires the **MODEL_FETCHED** event on success.
     */
    async fetch() {
        return new Promise((resolve, reject) => {
            const success = (response: SuccessResponse) => {
                this.values = this.mapSuccessResponse(response, 'fetch').data;

                this.sync();

                this.fire(MODEL_FETCHED);

                resolve(response);
            };

            this.request('fetch').then(success).catch(reject);
        });
    }

    /**
     * Saves the current status of the model on the backend. If the model has an id the performs an update. Otherwise, performs a create. 
     * If an update is performed, uses the PUT or PATCH method following the definition of Model.patchUpdates method.
     * 
     * Fires the **MODEL_SAVED** event on success.
     */
    async save() {
        return new Promise((resolve, reject) => {
            const action = this.values.id ? (this.patchUpdates() ? 'patch' : 'update') : 'save';

            const success = (response: SuccessResponse) => {
                this.values = this.mapSuccessResponse(response, action).data;

                this._deleted = false;

                this.sync();

                this.fire(MODEL_SAVED);

                resolve(response);
            };

            const failure = (error: ErrorResponse) => {
                // #TODO Add the errors to the error object.
                if (this.validationErrorCode() == error.response.status) this.validationErrors = error.response.data.errors;

                reject(error);
            }

            const data = this.mapSaveValues(action == 'patch' ? this.dirtyValues : this.values, action);

            this.validationErrors = {};

            this.request(action, data).then(success).catch(failure);
        });
    }

    /**
     * Deletes the model from the backend. The values of the model are not changed, so they can still be accessed.
     * If the backend uses soft deletion, this values (including the id) can be used to restore the data.
     * 
     * Fires the **MODEL_DELETED** event on success.
     */
    async delete() {
        return new Promise((resolve, reject) => {
            const success = (response: SuccessResponse) => {
                this._deleted = true;
                this.fire(MODEL_DELETED);
                resolve(response);
            };

            this.request('delete').then(success).catch(reject);
        });
    }
};
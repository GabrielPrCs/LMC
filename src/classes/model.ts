import { Utils } from './utils';
import { Requestable, HttpMethod } from './requestable';
import { Collection } from './collection';
import { ObservableEvent, Observer, Observable, MODEL_ROLLBACK, MODEL_SYNC, MODEL_FETCHED, MODEL_SAVED, MODEL_DELETED } from '../interfaces/observer-observable';
import { SuccessResponse } from '../interfaces/async-requests';
import { HttpRoutes } from './requestable';

export type ModelValue = any;
export interface ModelValues { [key: string]: ModelValue };

export abstract class Model extends Requestable implements Observable {

    private _deleted: boolean = false;
    private _values: ModelValues = {};
    private _syncValues: ModelValues = {};
    private _observers: Array<Observer> = [];

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
        this.sync();
        this.addTo(collections);
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
     * Adds an observer that will be notified when an event is fired. When an observer is notified,
     * the notify function will be called with the event that is beeing fired and the instance of the model
     * that fired the event.
     * 
     * If the observer already exists in the array of observers, then does nothing.
     * 
     * @param observer the observer to be added to the array of observers.
     * @returns the instance of the model for method chaining.
     */
    addObserver(observer: Observer): void {
        if (!this.observedBy(observer)) this._observers.push(observer);
    }

    /**
     * Removes the given observer from the array of observers. If the observer was not in the array, then does nothing.
     * 
     * If the observer is as collection, also removes the model from the collection.
     * 
     * @param observer the observer to be removed from the list of observers.
     * @returns the instance of the model for method chaining.
     */
    removeObserver(observer: Observer): void {
        if (this.observedBy(observer)) Utils.remove(this._observers, observer);
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
     * Generates an unique id for the model using its values.
     */
    key(): any {
        return this.values.id;
    }

    /**
     * Determines if the model is saved on the backend or not. A model is considered saved when it's key is not empty.
     */
    get exists(): boolean {
        return this.key() != null;
    }

    /**
     * Determines if the model has been successfully deleted from the backend.
     */
    get deleted(): boolean {
        return this._deleted;
    }

    /**
     * The current status of the model.
     */
    get values(): ModelValues {
        return this._values;
    }

    set values(values: ModelValues) {
        this._values = Utils.clone({ ...this.defaults(), ...this.values, ...values });
    }

    /**
     * 
     */
    private get saveAction(): string {
        return this.exists ? (this.patchUpdates() ? 'patch' : 'update') : 'save';
    }

    /**
     * The last synchronized status of the model.
     */
    get syncValues(): ModelValues {
        return this._syncValues;
    }

    /**
     * The values that will be sended to the server to be saved.
     */
    get saveValues(): ModelValues {
        return this.mapValuesToSave(Utils.clone(this.saveAction == 'patch' ? this.dirtyValues : this.values), this.saveAction)
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
        return !Utils.isEqual(this.values, this.syncValues);
    }

    /**
     * Returns the value of a given property of the model. If the property does not exist, then returns the default value.
     * 
     * @param property the property to get.
     * @param def the value to return when the property does not exist.
     */
    get(property: string, def: ModelValue = undefined): ModelValue {
        return Utils.getObjectProperty(this.values, property, def);
    }

    /**
     * Sets the value of a given property of the model. If the property does not exist, then it's created.
     * 
     * @param property the property to set.
     * @param value the new value of the property.
     */
    set(property: string, value: ModelValue): void {
        Utils.setObjectProperty(this.values, property, value);
    }

    /**
     * Removes a property from the model. The property wont be setted as null or undefined, it will be removed from the
     * values object.
     * 
     * @param property the property to remove.
     */
    remove(property: string): void {

    }

    /**
     * The defaults values for each one of the model properties.
     * 
     * @returns an ModelValues object with the status of a model that does not exists on backend yet.
     */
    defaults(): ModelValues {
        return { id: null };
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
            save: `/${this.name()}`,
            fetch: `/${this.name()}/${this.key()}`,
            patch: `/${this.name()}/${this.key()}`,
            update: `/${this.name()}/${this.key()}`,
            delete: `/${this.name()}/${this.key()}`
        };
    }

    /**
     * Returns the model's values object to the last sync status. The current values object is lost.
     * 
     * @returns the instance of the model for method chaining.
     */
    rollback(): void {
        this.values = this.syncValues;
        this.fire(MODEL_ROLLBACK);
    }

    /**
     * Sets the sync object to the current model's values object. The previous sync status is lost.
     * 
     * @returns the instance of the model for method chaining.
     */
    sync(): void {
        this._syncValues = Utils.clone({ ...this.defaults(), ...this.syncValues, ...this.values });
        this.fire(MODEL_SYNC);
    }

    /**
     * Sets the model's values object to it's defaults values.
     * 
     * @returns the instance of the model for method chaining.
     */
    clear(): void {
        this.values = this.defaults();
    }

    /**
     * Adds the model to one or more collections. This will have the same result than calling collection.add(model) on each
     * one of the collections.
     * 
     * @param col the collection or an array with the collections to where add the model.
     * @returns the instance of the model for method chaining.
     */
    addTo(col: Collection | Array<Collection>): void {
        const handler = (collection: Collection) => {
            if (!collection.contains(this)) collection.add(this);
        };

        if (col instanceof Collection) handler(col);
        else col.forEach(collection => handler(collection));
    }

    /**
     * Removes the model from one or more collections. This will have the same result than calling collection.remove(model) on each
     * one of the collections.
     * 
     * @param col the collection or an array with the collections from where remove the model.
     * @returns the instance of the model for method chaining.
     */
    removeFrom(col: Collection | Array<Collection>): void {
        if (col instanceof Collection) col.remove(this);
        else col.forEach(collection => collection.remove(this));
    }

    /**
     * Receives a copy of the model values. They can be mapped to send a different values to the server to be saved at the backend.
     */
    mapValuesToSave(values: ModelValue, action: string): ModelValues {
        return values;
    }

    /**
     * Fires the **MODEL_FETCHED** event on success.
     */
    async fetch(): Promise<SuccessResponse> {
        return new Promise<SuccessResponse>((resolve, reject) => {
            const success = (response: SuccessResponse) => {
                this.values = response.data;
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
    async save(): Promise<SuccessResponse> {
        return new Promise<SuccessResponse>((resolve, reject) => {
            const success = (response: SuccessResponse) => {
                this._deleted = false;
                this.values = response.data;
                this.sync();
                this.fire(MODEL_SAVED);
                resolve(response);
            };

            this.request(this.saveAction, this.saveValues).then(success).catch(reject);
        });
    }

    /**
     * Deletes the model from the backend. The values of the model are not changed, so they can still be accessed.
     * If the backend uses soft deletion, this values (including the id) can be used to restore the data.
     * 
     * Fires the **MODEL_DELETED** event on success.
     */
    async delete(): Promise<SuccessResponse> {
        return new Promise<SuccessResponse>((resolve, reject) => {
            const success = (response: SuccessResponse) => {
                this._deleted = true;
                this.fire(MODEL_DELETED);
                resolve(response);
            };

            this.request('delete').then(success).catch(reject);
        });
    }
};
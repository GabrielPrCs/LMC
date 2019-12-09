import { Utils } from '../utils/methods';
import { Collection } from './collection';
import { Requestable, HttpRoutes } from './requestable';
import { ObservableEvent, Observer, Observable, SuccessResponse } from '../utils/interfaces';

export type ModelKey = number | string;
export type ModelValue = any;
export interface ModelValues { [key: string]: ModelValue };

export const MODEL_SYNC: ObservableEvent = 'MODEL_SYNC';
export const MODEL_CLEAR: ObservableEvent = 'MODEL_CLEAR';
export const MODEL_SAVED: ObservableEvent = 'MODEL_SAVED';
export const MODEL_FETCHED: ObservableEvent = 'MODEL_FETCHED';
export const MODEL_DELETED: ObservableEvent = 'MODEL_DELETED';
export const MODEL_ROLLBACK: ObservableEvent = 'MODEL_ROLLBACK';

export abstract class Model extends Requestable implements Observable {
    private _deleted: boolean = false;
    private _values: ModelValues = {};
    private _syncValues: ModelValues = {};
    private _observers: Array<Observer> = [];

    /**
     * Creates a new instance of the model.
     * 
     * The initial status will be merged to the default values, giving priority to the parameter values over the default ones.
     * For this reason, is not necessary to pass the values of those properties that will have the default value. If no id
     * is provided on the initial values, the model will considered as a new model that has not been persisted on backend yet (model.id == null).
     *
     * The model will be added to each one of the collections passed.
     * 
     * @param values - The initial status of the model.
     * @param collection - An array of the collections to where the model has to be added.
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
     * @param observer - The observer to check if is present.
     * @return True if the observer is present, false otherwise.
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
     * @param observer - The observer to be added to the array of observers.
     */
    addObserver(observer: Observer): void {
        if (!this.observedBy(observer)) this._observers.push(observer);
    }

    /**
     * Removes the given observer from the array of observers. If the observer was not in the array, then does nothing.
     * 
     * @param observer - The observer to be removed from the list of observers.
     */
    removeObserver(observer: Observer): void {
        if (this.observedBy(observer)) Utils.remove(this._observers, observer);
    }

    /**
     * Notifies to each observer that an event has happened. Sends the event and the model that has fired the event
     * to the observer.
     * 
     * @param event - The event to notify.
     */
    fire(event: ObservableEvent): void {
        this._observers.forEach(observer => observer.notify(event, this));
    }

    /**
     * The name of the value stored in the model's ModelValues that is used as the primary key.FIt can be a dot notation path.
     * 
     * @returns A string with the name of the primary key.
     */
    get keyName(): string {
        return 'id';
    }

    /**
     * Gets the primary key from the model's values.
     * 
     * @returns The value of the primary key.
     */
    get key(): ModelKey {
        return this.values[this.keyName];
    }

    /**
     * Determines if the model has been successfully deleted from the backend.
     * 
     * @returns True if the model is deleted, false otherwise.
     */
    get deleted(): boolean {
        return this._deleted;
    }

    /**
     * Determines if the model is saved on the backend or not. A model is considered saved when it's key is not empty and has not been deleted.
     * 
     * @returns True if the model exists, false otherwise.
     */
    get exists(): boolean {
        return !this.deleted && this.key != null;
    }

    /**
     * The current status of the model.
     */
    get values(): ModelValues { return this._values }
    set values(values: ModelValues) { this._values = Utils.clone({ ...this.defaults(), ...this.values, ...values }) }

    /**
     * The action to perform when the model is saved. If the model does not exists, then performs a 'save'. If the model exists and
     * the updates shoul be patched, then performs a 'patch'. Otherwise, performs an 'update'.
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
     * Determines if the model's values has changed since the last call of sync method.
     */
    get dirty(): boolean {
        return !Utils.isEqual(this.values, this.syncValues);
    }

    /**
     * The values that have changed since the last call of the sync method.
     */
    get dirtyValues(): ModelValues {
        return Utils.objectDiff(this.values, this.syncValues);
    }

    /**
     * The values that will be sended to the server on the save method.
     */
    get saveValues(): ModelValues {
        return this.mapValuesToSave(Utils.clone(this.saveAction == 'patch' ? this.dirtyValues : this.values), this.saveAction)
    }

    /**
     * Returns the value of a given property of the model. If the property does not exist in the model values,
     * then returns the default value given as parameter (undefined by default).
     * 
     * @param property - The property to get.
     * @param def - The value to return when the property does not exist.
     * @returns The value of the property.
     */
    get(property: string, def: ModelValue = undefined): ModelValue {
        return Utils.getObjectProperty(this.values, property, def);
    }

    /**
     * Sets the value of a given property of the model. If the property does not exist, then it's created.
     * 
     * @param property - The property to set.
     * @param value The new value of the property.
     */
    set(property: string, value: ModelValue): void {
        Utils.setObjectProperty(this.values, property, value);
    }

    /**
     * Removes a property from the model. The property wont be setted as null or undefined, it will be removed from the
     * values object.
     * 
     * @param property - The property to remove.
     */
    remove(property: string): void { /* TODO */ }

    /**
     * The defaults values for each one of the model properties.
     * 
     * @returns A ModelValues object with the status of a just created model.
     */
    defaults(): ModelValues {
        return { id: null };
    }

    /**
     * Determines if the update request will be performed using PUT or PATCH.
     * 
     * @returns True if the update should be patched, false otherwise.
     */
    patchUpdates(): boolean {
        return false;
    }

    /**
     * By default, a model can perform three actions: fetch, save and delete. Fetch will get from the backend the values of the model.
     * Save will upload the values of the model to the backend. Delete will remove the model from the backend.F
     * 
     * @returns An object where each key is an action and the value associated with it is the backend route for this action.
     */
    protected defaultRoutes(): HttpRoutes {
        return {
            save: `/${this.name()}`,
            fetch: `/${this.name()}/${this.key}`,
            patch: `/${this.name()}/${this.key}`,
            update: `/${this.name()}/${this.key}`,
            delete: `/${this.name()}/${this.key}`
        };
    }

    /**
     * Returns the model's values object to the last sync status. The current values object is lost.
     * 
     * @fires MODEL_ROLLBACK
     */
    rollback(): void {
        this.values = this.syncValues;
        this.fire(MODEL_ROLLBACK);
    }

    /**
     * Sets the sync object to the current model's values object. The previous sync status is lost.
     * 
     * @fires MODEL_SYNC
     */
    sync(): void {
        this._syncValues = Utils.clone({ ...this.defaults(), ...this.syncValues, ...this.values });
        this.fire(MODEL_SYNC);
    }

    /**
     * Sets the model's values object to it's defaults values.
     * 
     * @fires MODEL_CLEAR
     */
    clear(): void {
        this.values = this.defaults();
        this.fire(MODEL_CLEAR);
    }

    /**
     * Adds the model to one or more collections. This will have the same result than calling Collection.add(model) on each
     * one of the collections.
     * 
     * @param col - The collection or an array with the collections where the model will be added.
     */
    addTo(col: Collection | Array<Collection>): void {
        const handler = (collection: Collection) => {
            if (!collection.contains(this)) collection.add(this);
        };

        if (col instanceof Collection) handler(col);
        else col.forEach(collection => handler(collection));
    }

    /**
     * Removes the model from one or more collections. This will have the same result than calling Collection.remove(model) on each
     * one of the collections.
     * 
     * @param col - The collection or an array with the collections from where the model will be removed.
     */
    removeFrom(col: Collection | Array<Collection>): void {
        if (col instanceof Collection) col.remove(this);
        else col.forEach(collection => collection.remove(this));
    }

    /**
     * Receives a copy of the model values. They can be mapped to send a different values to the server to be saved.
     */
    mapValuesToSave(values: ModelValue, action: string): ModelValues {
        return values;
    }

    /**
     * Fetches the model values from the backend. The returned object will be merged with the current model's values and
     * the default ones, giving priority to the returned ones over the current ones, and giving priority to the current ones
     * over the default ones. 
     * 
     * @fires MODEL_FETCHED
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
     * @fires MODEL_SAVED
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
     * @fires MODEL_DELETED
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
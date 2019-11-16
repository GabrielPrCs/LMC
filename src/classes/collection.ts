import { Utils } from './utils';
import { Requestable } from './requestable';
import { Model } from './model';
import { ObservableEvent, Observer, MODEL_DELETED } from '../interfaces/observer-observable';
import { ModelValues } from './model';
import { SuccessResponse, ErrorResponse } from 'interfaces/async-requests';

export type RequestFilter = boolean | number | string | object;
export interface RequestFilters { [key: string]: RequestFilter | Array<RequestFilter> };

export abstract class Collection extends Requestable implements Observer {

    private _models: Array<Model> = [];
    private _staticFilters: RequestFilters = {};

    /**
     * 
     * @param models 
     */
    constructor(models: Array<Model | ModelValues> = []) {
        super();
        this.add(models);
    }

    /**
     * 
     */
    toArray(): Array<ModelValues> {
        return this.models.map(model => model.values);
    }

    /**
     * 
     * @param event 
     * @param model 
     */
    notify(event: ObservableEvent, model: Model) {
        switch (event) {
            case MODEL_DELETED:
                this.remove(model);
                break;
        }
    }

    /**
     * 
     */
    get staticFilters(): RequestFilters {
        return this._staticFilters;
    }

    set staticFilters(filters: RequestFilters) {
        this._staticFilters = filters;
    }

    /**
     * An array with all the models that are in the collection at the moment.
     */
    get models(): Array<Model> {
        return this._models;
    }

    /**
     * 
     */
    get dirtyModels(): Array<Model> {
        return Utils.filter(this.models, { dirty: true });
    }

    /**
     * 
     */
    abstract model();

    /**
     * 
     */
    protected defaultRoutes() {
        return {
            fetch: `/${this.name()}`,
            save: `/${this.name()}`,
        };
    }

    /**
     * 
     * @returns the instance of the model for method chaining.
     */
    clear(): void {
        this._models = [];
    }

    /**
     * 
     */
    add(model: Model | ModelValues | Array<Model> | Array<ModelValues>): void {
        const handler = (_model: Model) => {
            this.models.push(_model);
            _model.addObserver(this);
        };

        if (model instanceof Array) model.forEach(mod => handler(mod instanceof Model ? mod : new (this.model())(mod)));
        else handler(model instanceof Model ? model : new (this.model())(model));
    }

    /**
     * 
     * @param mod the model or an array of models to remove from the collection.
     * @returns the instance of the model for method chaining.
     */
    remove(filter: Model | ModelValues | Array<Model> | Array<ModelValues>): void {
        const handler = (model: Model | ModelValues) => {
            // Removes every model that machs with the filter.
            let removed: Array<Model> = Utils.remove(this.models, { values: model instanceof Model ? model.values : model });
            // Removes the collection from the observers of each model removed.
            removed.forEach((rem: Model) => rem.removeObserver(this));
        };

        if (filter instanceof Array) filter.forEach(mod => handler(mod));
        else handler(filter);
    }

    /**
     * 
     * @param model
     */
    contains(model: Model | ModelValues): boolean {
        return this.findIndex(model) >= 0;
    }

    /**
     * 
     */
    filter(model: Model | ModelValues): Array<Model> {
        return Utils.filter(this.models, { values: model instanceof Model ? model.values : model });
    }

    /**
     * 
     */
    findIndex(model: Model | ModelValues): number {
        return Utils.findIndex(this.models, { values: model instanceof Model ? model.values : model });
    }

    /**
     * 
     */
    find(model: Model | ModelValues): Model {
        return Utils.find(this.models, { values: model instanceof Model ? model.values : model });
    }

    /**
     * 
     */
    sort(by: string | Array<string>, desc: boolean = false): void {
        this._models = Utils.sort(this.models, by instanceof Array ? by.map(item => 'values.' + item) : ['values.' + by]);
        if (desc) this.models.reverse();
    }

    /**
     * Given some fetch filters, merges them with the fixed filters of the colletion.
     * 
     * @param filters 
     */
    protected mergeFilters(filters: RequestFilters): RequestFilters {
        return { ...this._staticFilters, ...filters };
    }

    /**
     * Given a SuccessResponse, gets from it the items to add to the collection after a success fetch.
     * 
     * @param response 
     */
    protected getItems(response: SuccessResponse): Array<ModelValues> {
        return response.data;
    }

    /**
     * Called before the fetch is performed. Can be used to change filters or perform any other action.
     * 
     * By default, removes the models contained in the collection before fetching the new ones.
     * 
     * @param filters 
     */
    protected beforeFetch(filters: RequestFilters): void {
        this.clear();
    }

    /**
     * Called after the fetch is performed. Can be used to change the response or perform any other action.
     * 
     * By default, does nothing.
     * 
     * @param response 
     */
    protected fetched(response: SuccessResponse): void { }

    /**
     * 
     */
    async fetch(filters: RequestFilters = {}): Promise<SuccessResponse> {
        return new Promise<SuccessResponse>((resolve, reject) => {

            const success = (response: SuccessResponse) => {
                this.fetched(response);
                this.add(this.getItems(response).map((model: ModelValues) => new (this.model())(model)));
                resolve(response);
            };

            const config = this.mergeFilters(filters);

            this.beforeFetch(config);

            this.request('fetch', config).then(success).catch(reject);
        });
    }

    /**
     * 
     */
    async save(): Promise<SuccessResponse> {
        return new Promise<SuccessResponse>((resolve, reject) => {
            const success = (response: SuccessResponse) => {
                this.clear();
                this.add(response.data);
                resolve(response);
            };

            const failure = (error: ErrorResponse) => {
                let keys = Object.keys(error.response.data.errors);

                this.dirtyModels.forEach((model, index) => {

                    let model_keys = Utils.filter(keys, key => key.includes(`${this.name()}.${index}.`));

                    let errors = {};

                    model_keys.forEach(key => errors[key.replace(`${this.name()}.${index}.`, '')] = error.response.data.errors[key]);

                    model.validationErrors = model.mapValidationErrors({ response: { data: { errors } } } as ErrorResponse);
                });

                reject(error);
            }

            const data = { [this.name()]: this.dirtyModels.map(model => model.values) };

            this.request('save', data).then(success).catch(failure);
        });
    }
};
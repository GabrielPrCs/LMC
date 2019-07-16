import { Utils } from './utils';
import { Requestable } from './requestable';
import { Model } from './model';
import { ObservableEvent, Observer, MODEL_DELETED } from '../interfaces/observer-observable';
import { ModelValues } from '../interfaces/data-types';

export abstract class Collection extends Requestable implements Observer {
    private _models: Array<Model> = [];

    constructor(models: Array<Model> = []) {
        super();

        this.add(models);
    }

    notify(event: ObservableEvent, model: Model) {
        switch (event) {
            case MODEL_DELETED:
                model.removeObserver(this);
                this.remove(model.values);
                break;
        }
    }

    get models(): Array<Model> {
        return this._models;
    }

    set models(models: Array<Model>) {
        this._models = [...models];
    }

    get dirtyModels(): Array<Model> {
        return Utils.filter(this.models, { dirty: true });
    }

    plainJS() {
        return this.models.map(model => model.values);
    }

    abstract model();

    /**
     * 
     */
    protected defaultRoutes() {
        return {
            fetch: `/${this.name()}`,
        };
    }

    /**
     * 
     */
    clear() {
        this.models = [];
    }

    /**
     * 
     */
    add(models: Array<Model>) {
        models.forEach(model => {
            this.models.push(model);
            model.addObserver(this);
        });
    }

    /**
     * 
     */
    implace(models: Array<ModelValues>) {
        this.add(models.map(model => {
            let TModel = this.model();
            return new TModel(model);
        }));
    }

    /**
     * 
     */
    findIndex(values: ModelValues) {
        return Utils.findIndex(this.models, { values });
    }

    /**
     * 
     */
    find(values: ModelValues) {
        return Utils.find(this.models, { values });
    }

    /**
     * 
     */
    remove(values: ModelValues) {
        // #TODO check if the model still is in the collection to avoid deadlocks.
        return Utils.remove(this.models, { values });
    }

    /**
     * 
     */
    filter(values: ModelValues): Array<Model> {
        return Utils.filter(this.models, { values });
    }

    /**
     * 
     */
    async fetch(params = {}) {
        return new Promise((resolve, reject) => {

            const success = response => {
                this.clear();
                this.implace(response.data);
                resolve(response);
            };

            this.request('fetch', params).then(success).catch(reject);
        });
    }
};
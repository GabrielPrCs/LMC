import { Utils } from './utils';
import { Requestable } from './requestable';
import { Model } from './model';
import { ObservableEvent, Observer, MODEL_DELETED } from '../interfaces/observer-observable';
import { ModelValues } from '../interfaces/data-types';

export abstract class Collection extends Requestable implements Observer {
    
    private _models: Array<Model> = [];

    /**
     * 
     * @param models 
     */
    constructor(models: Array<Model> = []) {
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
                model.removeObserver(this);
                this.remove(model.values);
                break;
        }
    }

    /**
     * An array with all the models that are in the collection at the moment.
     */
    get models(): Array<Model> {
        return this._models;
    }

    set models(models: Array<Model>) {
        this._models = [...models];
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
        };
    }

    /**
     * **[Chainable]**
     * 
     * @returns the instance of the model for method chaining.
     */
    clear(): this {
        this.models = [];
        return this;
    }

    /**
     * **[Chainable]**
     * 
     * @param mod the model or an array of models to add to the collection.
     * @returns the instance of the model for method chaining.
     */
    add(mod: Model | Array<Model>): this {
        const handler = (model: Model) => {
            this.models.push(model);
            model.addObserver(this);
        };

        if(mod instanceof Model) handler(mod);
        else mod.forEach(model => handler(model));

        return this;
    }

    /**
     * **[Chainable]**
     * 
     * @param mod the model or an array of models to remove from the collection.
     * @returns the instance of the model for method chaining.
     */
    remove(values: ModelValues): this {
        // #TODO check if the model still is in the collection to avoid deadlocks.
        Utils.remove(this.models, { values });
        return this;
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
    contains(model: Model): boolean {
        return this.findIndex(model.values) >= 0;
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
                let TModel = this.model();
                this.add(response.data.map(model => new TModel(model)));
                resolve(response);
            };

            this.request('fetch', params).then(success).catch(reject);
        });
    }
};
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
        };
    }

    /**
     * **[Chainable]**
     * 
     * @returns the instance of the model for method chaining.
     */
    clear(): this {
        this._models = [];
        return this;
    }

    /**
     * **[Chainable]**
     * 
     */
    add(model: Model | ModelValues | Array<Model> | Array<ModelValues>): this {
        const handler = (_model: Model) => {
            this.models.push(_model);
            _model.addObserver(this);
        };

        const _Model = this.model();

        if (model instanceof Array) model.forEach(mod => handler(mod instanceof Model ? mod : new _Model(mod)));
        else handler(model instanceof Model ? model : new _Model(model));

        return this;
    }

    /**
     * **[Chainable]**
     * 
     * @param mod the model or an array of models to remove from the collection.
     * @returns the instance of the model for method chaining.
     */
    remove(filter: Model | ModelValues | Array<Model> | Array<ModelValues>): this {
        const handler = (model: Model | ModelValues) => {
            // Removes all every model that machs with the filter.
            let removed: Array<Model> = Utils.remove(this.models, { values: model instanceof Model ? model.values : model });
            // Removes the collection from the observers of each model removed.
            removed.forEach((rem: Model) => rem.removeObserver(this));
        };

        if (filter instanceof Array) filter.forEach(mod => handler(mod));
        else handler(filter);

        return this;
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
    sort(by: string | Array<string>, desc: boolean = false): this {
        this._models = Utils.sort(this.models, by instanceof Array ? by.map(item => 'values.' + item) : ['values.' + by]);
        if (desc) this.models.reverse();
        return this;
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
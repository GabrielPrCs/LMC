import { Utils } from './utils';
import { Requestable } from './requestable';
import { Model } from './model';
import { MODEL_DELETED } from '../interfaces/observable-events';
import { ObservableEvent, Observer } from '../interfaces/observer-observable';
import { ModelValues } from '../interfaces/data-types';

export abstract class Collection extends Requestable implements Observer {
    private _models: Array<Model> = [];

    constructor(models: Array<Model> = []) {
        super();

        models.forEach(item => this.implace(item));
    }

    notify(event: ObservableEvent, model: Model) {
        switch (event) {
            case MODEL_DELETED:
                model.removeObserver(this);
                this.remove(model.values[this.model().key()]);
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
        return this.filter((model: Model) => model.dirty);
    }

    plainJS() {
        return this.models.map(model => model.plainJS());
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
    add(model: Model) {
        this.models.push(model);
        model.addObserver(this);
    }

    /**
     * 
     */
    implace(values: ModelValues) {
        let TModel = this.model();
        this.add(new TModel(values));
    }

    /**
     * 
     */
    findIndex(filter) {
        return Utils.findIndex(this.models, filter);
    }

    /**
     * 
     */
    find(filter) {
        return Utils.find(this.models, filter);
    }

    /**
     * 
     */
    remove(id) {
        let filter = {};
        filter[this.model().key()] = id;
        return Utils.remove(this.models, filter);
    }

    /**
     * 
     */
    filter(filter): Array<Model> {
        return Utils.filter(this.models, filter);
    }

    /**
     * 
     */
    async fetch(params = {}) {
        return new Promise((resolve, reject) => {

            const success = response => {
                this.clear();
                response.data.forEach(item => this.implace(item));
                resolve(response);
            };

            this.request('fetch', params).then(success).catch(reject);
        });
    }
};
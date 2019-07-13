import { Utils } from './utils';
import { Data } from './data';
import { Requestable } from './requestable';
import { Model } from './model';
import { MODEL_DELETED } from './events';
import { ObservableEvent, Observer, Observable } from '../interfaces/observer-observable';

export abstract class Collection extends Requestable implements Observer {
    private _models: Data;

    constructor(models = []) {
        super();

        this._models = new Data([]);
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

    get models() {
        return this._models.values;
    }

    set models(models: Array<Model>) {
        this._models.values = [...models];
    }

    get dirtyModels() {
        return this.filter(model => model.dirty);
    }

    plainJS() {
        return this.models.map(model => model.plainJS());
    }

    abstract model()

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
    implace(values) {
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
    filter(filter) {
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
const Utils = require('./utils');
const Data = require('./data.js');
const Requestable = require('./requestable');

const {
    MODEL
} = require('./events');

module.exports = class Collection extends Requestable {
    constructor(models = []) {
        super();

        this._models = new Data([]);
        models.forEach(item => this.implace(item));
    }

    notify(event, model) {
        switch (event) {
            case MODEL.DELETED:
                model.removeObserver(this);
                this.remove(model.values[this.model().key()]);
                break;
        }
    }

    get models() {
        return this._models.values;
    }

    set models(models) {
        this._models.values = [...models];
    }

    get dirtyModels() {
        return this.filter(model => model.dirty);
    }

    plainJS() {
        return this.models.map(model => model.plainJS());
    }

    name() {
        return Utils.classNameToApiRoute(this.constructor.name);
    }

    model() {
        return Model;
    }

    /**
     * 
     */
    defaultRoutes() {
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
    add(model) {
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
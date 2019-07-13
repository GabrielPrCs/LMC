const Collection = require('./collection');

module.exports = class PaginatedCollection extends Collection {

    constructor(models = [], page = 1) {
        super(models);
        this._currentPage = page;

    }

    get currentPage() {
        return this._currentPage;
    }

    set currentPage(value) {
        if (value < 1) this.currentPage = 1;
        else this._currentPage = value;
    }

    pageParameter() {
        return 'page';
    }

    paginationData(response) {}

    /**
     * 
     */
    async fetch(params = {}) {
        return new Promise((resolve, reject) => {

            let config = {
                ...params,
            }

            config[this.pageParameter()] = this.currentPage;

            const success = response => {
                this.paginationData(response);
                resolve(response);
            }

            super.fetch(config).then(success).catch(reject);
        });

    }

    /**
     * 
     */
    async nextPage(params) {
        this.currentPage++;
        return this.fetch(params);
    }

    /**
     * 
     */
    async previousPage(params) {
        this.currentPage--;
        return this.fetch(params);
    }

    async goToPage(number, params) {
        this.currentPage = number;
        return this.fetch(params);
    }

}
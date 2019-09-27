import { Model } from './model';
import { Collection } from './collection';
import { PaginationData } from '../interfaces/data-types';
import { SuccessResponse, ErrorResponse } from '../interfaces/async-requests';

export abstract class PaginatedCollection extends Collection {
    private _currentPage: number = 1;
    private _paginationData: PaginationData<Model> = { items: [], hasMorePages: false };

    constructor(models = [], page = 1) {
        super(models);
        this._currentPage = page;
    }

    get currentPage(): number {
        return this._currentPage;
    }

    set currentPage(value: number) {
        if (value < 1) this.currentPage = 1;
        else this._currentPage = value;
    }

    pageParameter(): string {
        return 'page';
    }

    mapPaginationData(response: SuccessResponse): PaginationData<Model> {
        return {
            items: response.data.data,
            hasMorePages: response.data.next_page_url != null
        };
    }

    get isFirstPage(): boolean {
        return this.currentPage == 1;
    }

    get isLastPage(): boolean {
        return !this._paginationData.hasMorePages;
    }

    /**
     * 
     */
    async fetch(params = {}) {
        return new Promise((resolve, reject) => {

            let config = { ...params }

            config[this.pageParameter()] = this.currentPage;

            const success = (response: SuccessResponse) => {
                this.clear();
                this._paginationData = this.mapPaginationData(response);
                this.add(this._paginationData.items);
                resolve(response);
            };

            this.request('fetch', config).then(success).catch(reject);
        });
    }

    /**
     * 
     */
    async nextPage(params = {}) {
        this.currentPage++;
        return this.fetch(params);
    }

    /**
     * 
     */
    async previousPage(params = {}) {
        this.currentPage--;
        return this.fetch(params);
    }

    async goToPage(number: number, params = {}) {
        this.currentPage = number;
        return this.fetch(params);
    }
}
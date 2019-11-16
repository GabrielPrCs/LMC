import { Model } from './model';
import { Collection } from './collection';
import { ModelValues, ModelValue } from './model';
import { SuccessResponse } from '../interfaces/async-requests';
import { RequestFilters } from './collection';

export interface PaginationData<T> { items: Array<T>, hasMorePages: boolean };

/**
 * 
 */
export abstract class LazyCollection extends Collection {

    protected _currentPage: number = 1;
    protected _paginationData: PaginationData<Model> = { items: [], hasMorePages: false };

    constructor(models: Array<Model | ModelValue> = [], page: number = 1) {
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

    protected mergeFilters(filters: RequestFilters) {
        return {
            ...super.mergeFilters(filters),
            [this.pageParameter()]: this.currentPage
        };
    }

    protected getItems(response: SuccessResponse): Array<ModelValues> {
        return response.data.data;
    }

    protected fetched(response: SuccessResponse): void {
        super.fetched(response);
        this._paginationData = this.mapPaginationData(response);
    }
}
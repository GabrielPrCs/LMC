import { SuccessResponse } from '../utils/interfaces';
import { Model, ModelValues, ModelValue } from './model';
import { Collection, RequestFilters } from './collection';

export interface PaginationData<T> { items: Array<T>, lastPage: boolean };

/**
 * A collection where the items are not retrived all at the same time, but they are fetched in chuncks.
 */
export abstract class LazyCollection extends Collection {
    protected _currentPage: number = 1;
    protected _paginationData: PaginationData<Model> = { items: [], lastPage: true };

    constructor(models: Array<Model | ModelValue> = [], page: number = 1) {
        super(models);
        this._currentPage = page;
    }

    /**
     * The name of the parameter that will be sent on every fetch request to the backend, indicating the number
     * of page to retrieve. By default, uses 'page' as parameter.
     * 
     * @returns A string with the name of the parameter.
     */
    pageParameter(): string {
        return 'page';
    }

    /**
     * The number of the last fetched page.
     */
    get currentPage(): number { return this._currentPage }
    set currentPage(value: number) { this._currentPage = value < 1 ? 1 : value }

    /**
     * Indicates if the collection is in its first page.
     * 
     * @returns True if the collection is in the first page, false otherwise.
     */
    get isFirstPage(): boolean {
        return this.currentPage == 1;
    }

    /**
     * Indicates if the collection is in its last page.
     * 
     * @returns True if the collection is in the last page, false otherwise.
     */
    get isLastPage(): boolean {
        return this._paginationData.lastPage;
    }

    /**
     * 
     * @param filters 
     */
    protected mergeFilters(filters: RequestFilters): RequestFilters {
        return { ...super.mergeFilters(filters), [this.pageParameter()]: this.currentPage };
    }

    /**
     * 
     * @param response 
     */
    protected getItems(response: SuccessResponse): Array<ModelValues> {
        return response.data.data;
    }

    /**
     * 
     * @param response 
     * @returns
     */
    mapPaginationData(response: SuccessResponse): PaginationData<Model> {
        return { items: response.data.data, lastPage: response.data.next_page_url == null };
    }

    /**
     * 
     */
    async fetch(filters: RequestFilters = {}): Promise<SuccessResponse> {
        return new Promise<SuccessResponse>((resolve, reject) => {
            const success = (response: SuccessResponse) => {
                this._paginationData = this.mapPaginationData(response);
                resolve(response);
            };

            super.fetch(filters).then(success).catch(reject);
        });
    }
}
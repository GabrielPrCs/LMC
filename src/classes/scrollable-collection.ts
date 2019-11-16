import { Model } from './model';
import { LazyCollection } from './lazy-collection';
import { ModelValue } from './model';
import { RequestFilters } from './collection';
import { SuccessResponse } from 'interfaces/async-requests';

export abstract class ScrollableCollection extends LazyCollection {
    constructor(models: Array<Model | ModelValue> = [], page: number = 0) {
        super(models, page);
    }

    /**
     * 
     * @param params 
     */
    protected beforeFetch(params: RequestFilters): void { }

    /**
     * 
     * @param filters 
     */
    async fetch(filters: RequestFilters = {}): Promise<SuccessResponse> {
        throw "Fetch method can't be called on a ScrollableCollection";
    }

    /**
     * 
     * @param filters 
     */
    async more(filters: RequestFilters = {}): Promise<SuccessResponse> {
        this.currentPage++;
        return super.fetch(filters);
    }

    /**
     * 
     * @param filters 
     */
    async reset(filters: RequestFilters = {}): Promise<SuccessResponse> {
        this.clear();
        this.currentPage = 0;
        return this.more(filters);
    }
}
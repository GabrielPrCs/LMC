import { Model } from './model';
import { LazyCollection } from './lazy-collection';
import { ModelValue } from './model';
import { RequestFilters } from './collection';
import { SuccessResponse } from 'interfaces/async-requests';

export abstract class PaginatedCollection extends LazyCollection {
    constructor(models: Array<Model | ModelValue> = [], page: number = 1) {
        super(models, page);
    }

    /**
     * 
     */
    async nextPage(filters: RequestFilters = {}): Promise<SuccessResponse> {
        this.currentPage++;
        return this.fetch(filters);
    }

    /**
     * 
     */
    async previousPage(filters: RequestFilters = {}): Promise<SuccessResponse> {
        this.currentPage--;
        return this.fetch(filters);
    }

    async goToPage(number: number, filters: RequestFilters = {}): Promise<SuccessResponse> {
        this.currentPage = number;
        return this.fetch(filters);
    }
}
import { Model, ModelValue } from './model';
import { RequestFilters } from './collection';
import { LazyCollection } from './lazy-collection';
import { SuccessResponse } from '../utils/interfaces';

export abstract class PaginatedCollection extends LazyCollection {
    constructor(models: Array<Model | ModelValue> = [], page: number = 1) {
        super(models, page);
    }

    /**
     * 
     * @param filters 
     */
    async nextPage(filters: RequestFilters = {}): Promise<SuccessResponse> {
        this.currentPage++;
        return this.fetch(filters);
    }

    /**
     * 
     * @param filters 
     */
    async previousPage(filters: RequestFilters = {}): Promise<SuccessResponse> {
        this.currentPage--;
        return this.fetch(filters);
    }

    /**
     * 
     * @param number 
     * @param filters 
     */
    async goToPage(number: number, filters: RequestFilters = {}): Promise<SuccessResponse> {
        this.currentPage = number;
        return this.fetch(filters);
    }
}
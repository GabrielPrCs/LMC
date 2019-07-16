import { Model } from './classes/model';
import { Collection } from './classes/collection';
import { PaginatedCollection } from './classes/paginated-collection';

export { Model, Collection, PaginatedCollection };

(<any> window).Model = Model;
(<any> window).Collection = Collection;
(<any> window).PaginatedCollection = PaginatedCollection;
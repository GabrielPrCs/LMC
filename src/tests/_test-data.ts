import { Model } from '../classes/model';
import { Collection } from '../classes/collection';
import { PaginatedCollection } from '../classes/paginated-collection';

export class Todo extends Model {
    basePath() {
        return 'https://jsonplaceholder.typicode.com';
    }

    defaults() {
        return {
            id: null,
            userId: null,
            title: '',
            completed: false
        };
    }
}


export class Todos extends Collection {
    basePath() {
        return 'https://jsonplaceholder.typicode.com';
    }

    model() {
        return Todo;
    }
}

export class PaginatedTodos extends PaginatedCollection {
    constructor(models = [], page = 1) {
        super(models, page);
    }

    basePath() {
        return 'https://jsonplaceholder.typicode.com';
    }

    pageParameter() {
        return '_page';
    }

    name() {
        return 'todos';
    }

    model() {
        return Todo;
    }
}

export const Model1 = {
    id: 1,
    userId: 1,
    title: 'delectus aut autem',
    completed: false
};

/**
 * 
 */
export const page1 = [{
    userId: 1,
    id: 1,
    title: "delectus aut autem",
    completed: false
},
{
    userId: 1,
    id: 2,
    title: "quis ut nam facilis et officia qui",
    completed: false
},
{
    userId: 1,
    id: 3,
    title: "fugiat veniam minus",
    completed: false
},
{
    userId: 1,
    id: 4,
    title: "et porro tempora",
    completed: true
},
{
    userId: 1,
    id: 5,
    title: "laboriosam mollitia et enim quasi adipisci quia provident illum",
    completed: false
},
{
    userId: 1,
    id: 6,
    title: "qui ullam ratione quibusdam voluptatem quia omnis",
    completed: false
},
{
    userId: 1,
    id: 7,
    title: "illo expedita consequatur quia in",
    completed: false
},
{
    userId: 1,
    id: 8,
    title: "quo adipisci enim quam ut ab",
    completed: true
},
{
    userId: 1,
    id: 9,
    title: "molestiae perspiciatis ipsa",
    completed: false
},
{
    userId: 1,
    id: 10,
    title: "illo est ratione doloremque quia maiores aut",
    completed: true
}
];

export const page2 = [{
    userId: 1,
    id: 11,
    title: "vero rerum temporibus dolor",
    completed: true
},
{
    userId: 1,
    id: 12,
    title: "ipsa repellendus fugit nisi",
    completed: true
},
{
    userId: 1,
    id: 13,
    title: "et doloremque nulla",
    completed: false
},
{
    userId: 1,
    id: 14,
    title: "repellendus sunt dolores architecto voluptatum",
    completed: true
},
{
    userId: 1,
    id: 15,
    title: "ab voluptatum amet voluptas",
    completed: true
},
{
    userId: 1,
    id: 16,
    title: "accusamus eos facilis sint et aut voluptatem",
    completed: true
},
{
    userId: 1,
    id: 17,
    title: "quo laboriosam deleniti aut qui",
    completed: true
},
{
    userId: 1,
    id: 18,
    title: "dolorum est consequatur ea mollitia in culpa",
    completed: false
},
{
    userId: 1,
    id: 19,
    title: "molestiae ipsa aut voluptatibus pariatur dolor nihil",
    completed: true
},
{
    userId: 1,
    id: 20,
    title: "ullam nobis libero sapiente ad optio sint",
    completed: true
}
];

export const page5 = [{
    userId: 3,
    id: 41,
    title: "aliquid amet impedit consequatur aspernatur placeat eaque fugiat suscipit",
    completed: false
},
{
    userId: 3,
    id: 42,
    title: "rerum perferendis error quia ut eveniet",
    completed: false
},
{
    userId: 3,
    id: 43,
    title: "tempore ut sint quis recusandae",
    completed: true
},
{
    userId: 3,
    id: 44,
    title: "cum debitis quis accusamus doloremque ipsa natus sapiente omnis",
    completed: true
},
{
    userId: 3,
    id: 45,
    title: "velit soluta adipisci molestias reiciendis harum",
    completed: false
},
{
    userId: 3,
    id: 46,
    title: "vel voluptatem repellat nihil placeat corporis",
    completed: false
},
{
    userId: 3,
    id: 47,
    title: "nam qui rerum fugiat accusamus",
    completed: false
},
{
    userId: 3,
    id: 48,
    title: "sit reprehenderit omnis quia",
    completed: false
},
{
    userId: 3,
    id: 49,
    title: "ut necessitatibus aut maiores debitis officia blanditiis velit et",
    completed: false
},
{
    userId: 3,
    id: 50,
    title: "cupiditate necessitatibus ullam aut quis dolor voluptate",
    completed: true
}
];

export const page1UID3 = [{
    userId: 3,
    id: 41,
    title: "aliquid amet impedit consequatur aspernatur placeat eaque fugiat suscipit",
    completed: false
},
{
    userId: 3,
    id: 42,
    title: "rerum perferendis error quia ut eveniet",
    completed: false
},
{
    userId: 3,
    id: 43,
    title: "tempore ut sint quis recusandae",
    completed: true
},
{
    userId: 3,
    id: 44,
    title: "cum debitis quis accusamus doloremque ipsa natus sapiente omnis",
    completed: true
},
{
    userId: 3,
    id: 45,
    title: "velit soluta adipisci molestias reiciendis harum",
    completed: false
},
{
    userId: 3,
    id: 46,
    title: "vel voluptatem repellat nihil placeat corporis",
    completed: false
},
{
    userId: 3,
    id: 47,
    title: "nam qui rerum fugiat accusamus",
    completed: false
},
{
    userId: 3,
    id: 48,
    title: "sit reprehenderit omnis quia",
    completed: false
},
{
    userId: 3,
    id: 49,
    title: "ut necessitatibus aut maiores debitis officia blanditiis velit et",
    completed: false
},
{
    userId: 3,
    id: 50,
    title: "cupiditate necessitatibus ullam aut quis dolor voluptate",
    completed: true
}
];
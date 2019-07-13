import * as assert from 'assert';
import { Model } from './classes/model';
import { Collection } from './classes/collection';
import { PaginatedCollection } from './classes/paginated-collection';


interface ServerResponseConfig {
    data: string
}

interface ServerResponse {
    data: object,
    config: ServerResponseConfig
}

class Todo extends Model {

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

class Todos extends Collection {
    constructor(models = []) {
        super(models);
    }

    basePath() {
        return 'https://jsonplaceholder.typicode.com';
    }

    model() {
        return Todo;
    }
}

class PaginatedTodos extends PaginatedCollection {
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

async function modelTests() {

    /**
     * Existing record.
     */
    let model = new Todo({ id: 1 });

    // Fetching.
    await model.fetch().then(_ => assert.deepEqual(model.values, {
        id: 1,
        userId: 1,
        title: 'delectus aut autem',
        completed: false
    }));

    // Dirty.
    assert.equal(model.dirty, false);
    model.values.title = 'Hola';
    assert.equal(model.dirty, true);

    // Rollback.
    model.rollback();
    assert.equal(model.values.title, 'delectus aut autem');

    // Sync.
    model.values.title = "Chau";
    model.sync();
    assert.equal(model.values.title, 'Chau');
    assert.deepEqual(model.syncValues, model.values);

    // Update.
    model.values.title = "Updating";
    await model.save().then((response: ServerResponse) => {
        // The request should have all the model's values.
        assert.deepEqual(JSON.parse(response.config.data), model.values);

        assert.deepEqual(model.values, response.data);
        assert.deepEqual(model.values, model.syncValues);
    });

    // Patch.
    model.patchUpdates = function () { return true; };

    model.values.title = "Patching";
    await model.save().then((response: ServerResponse) => {
        // The request should only have the changed model's values.
        assert.deepEqual(JSON.parse(response.config.data), { title: model.values.title });

        assert.deepEqual(model.values, response.data);
        assert.deepEqual(model.values, model.syncValues);
    });

    // Clear.
    model.clear();
    assert.deepEqual(model.values, model.defaults());

    // Deleting.
    assert.equal(model.deleted, false);
    await model.delete().then(_ => assert.equal(model.deleted, true));

    /**
     * Non existing record.
     */
    model = new Todo({ id: -2 });

    await model.fetch().catch(error => assert.equal(404, error.response.status));

    /**
     * Creating a new record.
     */
    model = new Todo();
    model.values.title = "Creating";
    await model.save().then((response: ServerResponse) => {
        assert.deepEqual(model.values, response.data);
        assert.deepEqual(model.syncValues, model.values);
        assert.equal(model.values.id, 201);
    });
}

async function collectionTests() {

    let todos = new Todos();

    await todos.fetch().then((response: ServerResponse) => assert.deepEqual(todos.plainJS(), response.data));

    todos.clear();

    assert.deepEqual(todos.models, []);

    /**
     * Add a model to the collection.
     */
    let todo1 = new Todo({ id: 1 });

    todos.add(todo1);

    assert.deepEqual(todos.models, [todo1]);

    /**
     * Implace a model in the collection.
     */
    todos.implace({ id: 2 });

    assert.deepEqual(todos.plainJS(), [todo1.values, {
        id: 2,
        userId: null,
        title: '',
        completed: false
    }]);

    /**
     * Find an existing item.
     */
    let finded = todos.find({ id: 1 });

    assert.deepEqual(finded, todo1);

    /**
     * Find a non existing item.
     */
    finded = todos.find({ id: -3 });

    assert.equal(finded, undefined);

    /**
     * Remove an non existing item.
     */
    let todo2 = new Todo({ id: 2 });

    let removed = todos.remove(32);

    assert.deepEqual(todos.plainJS(), [todo1.values, todo2.values]);
    assert.deepEqual(removed, []);

    /**
     * Remove an existing item.
     */
    todos.remove(2);

    assert.deepEqual(todos.plainJS(), [todo1.values]);

    /**
     * Bind a model to a collection using the model's constructor.
     */
    let todo3 = new Todo({ id: 3 }, todos);

    assert.deepEqual(todos.plainJS(), [todo1.values, todo3.values]);

    /**
     * Removing a model from a collection deleting the model itself.
     */
    await todo3.delete();

    assert.deepEqual(todos.plainJS(), [todo1.values]);

    /**
     * Fetching a list with a filter applied.
     */
    let filter = { id: 19 };

    await todos.fetch(filter).then(_ => assert.equal(todos.models.length, 1));

    /**
     * Getting the models that had change.
     */
    todos.clear();

    await todo1.fetch();
    await todo2.fetch();
    await todo3.fetch();

    todos.add(todo1);
    todos.add(todo2);
    todos.add(todo3);

    todo1.values.title = "Title changed";

    assert.deepEqual(todos.dirtyModels, [todo1]);

    todo1.sync();

    assert.deepEqual(todos.dirtyModels, []);
}

async function paginatedCollectionTests() {
    /**
     * 
     */
    const page1 = [{
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

    const page2 = [{
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

    const page5 = [{
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

    const page1UID3 = [{
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

    /**
     * Fetching the current page (1).
     */
    let todos = new PaginatedTodos();
    await todos.fetch().then(_ => assert.deepEqual(todos.plainJS(), page1));

    /**
     * Fetching the next page.
     */
    await todos.nextPage().then(_ => assert.deepEqual(todos.plainJS(), page2));

    /**
     * Fetching the previous page.
     */
    await todos.previousPage().then(_ => assert.deepEqual(todos.plainJS(), page1));

    /**
     * Fetching a specific page.
     */
    await todos.goToPage(5).then(_ => assert.deepEqual(todos.plainJS(), page5));

    /**
     * Fetching the first page for the todos of user with id 3.
     */
    const filter = { userId: 3 };

    await todos.goToPage(1, filter).then(_ => assert.deepEqual(todos.plainJS(), page1UID3));
}

async function run() {
    await modelTests();
    await collectionTests();
    await paginatedCollectionTests();

    console.log('Tested without failures!!! Awesome :D');
}

run();
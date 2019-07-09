var assert = require('assert');
const Model = require('./src/model');
const Collection = require('./src/collection');

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
    basePath() {
        return 'https://jsonplaceholder.typicode.com';
    }

    model() {
        return Todo;
    }
}

async function modelTests() {

    /**
     * Existing record.
     */
    let model = new Todo({
        id: 1
    });

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

    // Clear.
    model.clear();
    assert.deepEqual(model.values, model.defaults());

    /**
     * Non existing record.
     */
    model = new Todo({
        id: -2
    });

    await model.fetch().catch(error => assert.equal(404, error.response.status));
}

async function collectionTests() {

    let todos = new Todos();

    await todos.fetch().then(response => assert.deepEqual(todos.toPlainArray(), response.data));

    todos.clear();

    assert.deepEqual(todos.models, []);

    /**
     * Add a model to the collection.
     */
    let todo1 = new Todo({
        id: 1
    });

    todos.add(todo1);

    assert.deepEqual(todos.models, [todo1]);

    /**
     * Implace a model in the collection.
     */
    todos.implace({
        id: 2
    });

    assert.deepEqual(todos.toPlainArray(), [todo1.values, {
        id: 2,
        userId: null,
        title: '',
        completed: false
    }]);

    /**
     * Find an existing item.
     */
    let finded = todos.find({
        id: 1
    });

    assert.deepEqual(finded, todo1);

    /**
     * Find a non existing item.
     */
    finded = todos.find({
        id: -3
    });

    assert.equal(finded, undefined);

    /**
     * Remove an non existing item.
     */
    let todo2 = new Todo({
        id: 2
    });

    let removed = todos.remove(32);

    assert.deepEqual(todos.toPlainArray(), [todo1.values, todo2.values]);
    assert.deepEqual(removed, []);

    /**
     * Remove an existing item.
     */
    todos.remove(2);

    assert.deepEqual(todos.toPlainArray(), [todo1.values]);

    /**
     * Bind a model to a collection using the model's constructor.
     */
    let todo3 = new Todo({
        id: 3
    }, todos);

    assert.deepEqual(todos.toPlainArray(), [todo1.values, todo3.values]);

    /**
     * Removing a model from a collection deleting the model itself.
     */
    await todo3.delete();

    assert.deepEqual(todos.toPlainArray(), [todo1.values]);

    /**
     * Fetching a list with a filter applied.
     */
    let filter = {
        id: 19
    };

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

modelTests();
collectionTests();
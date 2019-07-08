var assert = require('assert');
const Model = require('../src/model');

async function run() {

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

    /**
     * Existing record.
     */
    let model = new Todo({
        id: 1
    });

    // Fetching.
    await model.fetch().then(response => assert.deepEqual(model.values, {
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

    model.fetch().catch(error => assert.equal(404, error.response.status));
}

run();
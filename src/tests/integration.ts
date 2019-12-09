import * as assert from 'assert';
import { Todo, Todos } from './_test-data';
import { SuccessResponse } from '../utils/interfaces';

export const Tests = [
    {
        title: 'model.addTo(Array<Collection>)',
        description: 'Adding the same model to multiple collections',
        handler: function () {
            let col1 = new Todos();
            let col2 = new Todos();
            let col3 = new Todos();

            let model = new Todo({ id: 1 });

            model.addTo([col1, col2, col3]);

            assert.deepEqual(col1.models, [model]);
            assert.deepEqual(col2.models, [model]);
            assert.deepEqual(col3.models, [model]);

            assert.equal(model.observedBy(col1), true);
            assert.equal(model.observedBy(col2), true);
            assert.equal(model.observedBy(col3), true);
        }
    },
    {
        title: 'new Todo(values?, collection)',
        description: 'Add a model to a collection using the model constructor',
        handler: function () {
            let todos = new Todos();

            assert.equal(todos.contains({ id: 1 }), false);

            let todo = new Todo({ id: 1 }, [todos]);

            assert.equal(todos.contains(todo), true);
        }
    },
    {
        title: 'model.removeFrom(Collection)',
        description: 'Removing a model from a collection',
        handler: function () {
            let todo1 = new Todo({ id: 1 });
            let todo2 = new Todo({ id: 2 });
            let todo3 = new Todo({ id: 3 });

            let todos = new Todos([todo1, todo2, todo3]);

            assert.deepEqual(todos.models, [todo1, todo2, todo3]);

            todo1.removeFrom([todos]);

            assert.deepEqual(todos.models, [todo2, todo3]);
        }
    },
    {
        title: 'model.delete()',
        description: 'Removing a model from a collection deleting the model itself',
        handler: async function () {
            let todos = new Todos();

            let todo = new Todo({ id: 1 }, [todos]);

            assert.equal(todos.contains(todo), true);

            await todo.delete();

            assert.equal(todos.contains(todo), false);
        }
    },

];

//     /**
//      * Removes an observer from the model.
//      */
//     model.removeObserver(col1);

//     assert.equal(model.observedBy(col1), false);


// /**
//  * Methods chaining.
//  */
// todos.clear().add([todo1, todo3]).remove(todo1);

// assert.deepEqual(todos.models, [todo3]);
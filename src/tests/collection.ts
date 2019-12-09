import * as assert from 'assert';
import { Todo, Todos } from './_test-data';
import { SuccessResponse } from '../utils/interfaces';


export const Tests = [
    {
        title: 'new Collection(Array<Model>)',
        description: 'Creating a new collection and adding a set of models to it using the constructor',
        handler: function () {
            // Creates some models.
            let todo1 = new Todo({ id: 1 });
            let todo2 = new Todo({ id: 2 });
            let todo3 = new Todo({ id: 3 });
            // Creates a new collection and adds the models to it.
            let todos = new Todos([todo1, todo2, todo3]);
            // Expects the collection to contain the created models.
            assert.equal(todos.contains(todo1), true);
            assert.equal(todos.contains(todo2), true);
            assert.equal(todos.contains(todo3), true);
            // Expects the models to be observed by the collection.
            assert.equal(todo1.observedBy(todos), true);
            assert.equal(todo2.observedBy(todos), true);
            assert.equal(todo3.observedBy(todos), true);
        }
    },
    {
        title: 'new Collection(Array<ModelValues>)',
        description: 'Creating a new collection and adding a set of models to it using the constructor',
        handler: function () {
            // Creates a new collection and adds the models to it.
            let todos = new Todos([{ id: 1 }, { id: 2 }, { id: 3 }]);
            // Get the models.
            let todo1 = todos.find({ id: 1 });
            let todo2 = todos.find({ id: 2 });
            let todo3 = todos.find({ id: 3 });
            // Expects the collection to contain the created models.
            assert.equal(todos.contains(todo1), true);
            assert.equal(todos.contains(todo2), true);
            assert.equal(todos.contains(todo3), true);
            // Expects the models to be observed by the collection.
            assert.equal(todo1.observedBy(todos), true);
            assert.equal(todo2.observedBy(todos), true);
            assert.equal(todo3.observedBy(todos), true);
        }
    },
    {
        title: 'Collection.add(Model)',
        description: 'Adding a model to a collection using an existing model',
        handler: function () {
            // Creates the collection with some models on it.
            let todo1 = new Todo({ id: 1 });
            let todo2 = new Todo({ id: 2 });
            let todo3 = new Todo({ id: 3 });
            let todos = new Todos([todo1, todo2, todo3]);
            // Creates the model to add.
            let todo = new Todo({ id: 1 });
            // Adds the model to the collection.
            todos.add(todo);
            // Expects the collection to contain the model and to have 4 items.
            assert.equal(todos.models.length, 4);
            assert.equal(todos.contains(todo), true);
            // Expects the models to be observed by the collection.
            assert.equal(todo1.observedBy(todos), true);
            // Expects the previous added models to still be on the collection and observed by it.
            assert.equal(todos.contains(todo1), true);
            assert.equal(todos.contains(todo2), true);
            assert.equal(todos.contains(todo3), true);
            assert.equal(todo1.observedBy(todos), true);
            assert.equal(todo2.observedBy(todos), true);
            assert.equal(todo3.observedBy(todos), true);
        }
    },
    {
        title: 'Collection.add(ModelValues)',
        description: 'Adding a model to a collection using a ModelValues object',
        handler: function () {
            // Creates the collection with some models on it.
            let todo1 = new Todo({ id: 1 });
            let todo2 = new Todo({ id: 2 });
            let todo3 = new Todo({ id: 3 });
            let todos = new Todos([todo1, todo2, todo3]);
            // Adds the model to the collection.
            todos.add({ id: 10, userId: 4, title: 'Created model', completed: true });
            // Expects the collection to contain the model and to have 4 items.
            assert.equal(todos.models.length, 4);
            assert.equal(todos.contains({ id: 1 }), true);
            // Expects the model to be observed by the collection and to have the ModelValues as its own values.
            let finded = todos.find({ id: 10 });
            assert.equal(finded.observedBy(todos), true);
            assert.deepEqual(finded.values, { id: 10, userId: 4, title: 'Created model', completed: true });
            // Expects the previous added models to still be on the collection and observed by it.
            assert.equal(todos.contains(todo1), true);
            assert.equal(todos.contains(todo2), true);
            assert.equal(todos.contains(todo3), true);
            assert.equal(todo1.observedBy(todos), true);
            assert.equal(todo2.observedBy(todos), true);
            assert.equal(todo3.observedBy(todos), true);
        }
    },
    {
        title: 'Collection.add(Array<Model>)',
        description: 'Adding multiple models to a collection using an Array<Model>',
        handler: function () {
            // Creates the collection with some models on it.
            let todo1 = new Todo({ id: 1 });
            let todo2 = new Todo({ id: 2 });
            let todo3 = new Todo({ id: 3 });
            let todos = new Todos([todo1, todo2, todo3]);
            // Creates some models to add.
            let todo4 = new Todo({ id: 4 });
            let todo5 = new Todo({ id: 5 });
            // Adds the models to the collection. 
            todos.add([todo4, todo5]);
            // Expects the collection to contain the model and to have 5 items.
            assert.equal(todos.models.length, 5);
            assert.equal(todos.contains(todo4), true);
            assert.equal(todos.contains(todo5), true);
            // Expects the just added models to be observed by the collection.
            assert.equal(todo4.observedBy(todos), true);
            assert.equal(todo5.observedBy(todos), true);
            // Expects the previous added models to still be on the collection and observed by it.
            assert.equal(todos.contains(todo1), true);
            assert.equal(todos.contains(todo2), true);
            assert.equal(todos.contains(todo3), true);
            assert.equal(todo1.observedBy(todos), true);
            assert.equal(todo2.observedBy(todos), true);
            assert.equal(todo3.observedBy(todos), true);
        }
    },
    {
        title: 'Collection.add(Array<ModelValues>)',
        description: 'Adding multiple models to a collection using an Array<ModelValues>',
        handler: function () {
            // Creates the collection with some models on it.
            let todo1 = new Todo({ id: 1 });
            let todo2 = new Todo({ id: 2 });
            let todo3 = new Todo({ id: 3 });
            let todos = new Todos([todo1, todo2, todo3]);
            // Adds the models to the collection. 
            todos.add([{ id: 10, userId: 4, title: 'Created model 1', completed: true }, { id: 11, userId: 5, title: 'Created model 2', completed: false }]);
            // Expects the collection to contain the model and to have 5 items.
            assert.equal(todos.models.length, 5);
            assert.equal(todos.contains({ id: 10 }), true);
            assert.equal(todos.contains({ id: 11 }), true);
            // Expects the just added models to be observed by the collection and to have the ModelValues as it own values.
            let finded1 = todos.find({ id: 10 });
            let finded2 = todos.find({ id: 11 });
            assert.equal(finded1.observedBy(todos), true);
            assert.equal(finded2.observedBy(todos), true);
            assert.deepEqual(finded1.values, { id: 10, userId: 4, title: 'Created model 1', completed: true });
            assert.deepEqual(finded2.values, { id: 11, userId: 5, title: 'Created model 2', completed: false });
            // Expects the previous added models to still be on the collection and observed by it.
            assert.equal(todos.contains(todo1), true);
            assert.equal(todos.contains(todo2), true);
            assert.equal(todos.contains(todo3), true);
            assert.equal(todo1.observedBy(todos), true);
            assert.equal(todo2.observedBy(todos), true);
            assert.equal(todo3.observedBy(todos), true);
        }
    },
    {
        title: 'Collection.clear()',
        description: 'Clearing a collection',
        handler: function () {
            // Creates a collection with some models on it.
            let todos = new Todos([{ id: 1 }, { id: 2 }]);
            // Expects the collection to have 2 models.
            assert.equal(todos.models.length, 2);
            // Clears the collection.
            todos.clear();
            // Expects the collection to have 0 models.
            assert.deepEqual(todos.models, []);
            assert.equal(todos.models.length, 0);
        }
    },
    {
        title: 'Collection.find(Model)',
        description: 'Finding a model that is contained by a collection using the model instance',
        handler: async function () {
            // Creates a collection with some models on it.
            let todo1 = new Todo({ id: 1, title: 'Title 1' });
            let todo2 = new Todo({ id: 2, title: 'Title 2' });
            let todo3 = new Todo({ id: 3, title: 'Title 3' });
            let todos = new Todos([todo1, todo2, todo3]);
            // Finds the moodel with the id = 2.
            let finded = todos.find(todo2);
            // Expects the model to have the title = "Title 2".
            assert.equal(finded.values.title, 'Title 2');
        }
    },
    {
        title: 'Collection.find(ModelValues)',
        description: 'Finding a model that is contained by a collection using a ModelValues object',
        handler: async function () {
            // Creates a collection with some models on it.
            let todos = new Todos([{ id: 1, title: 'Title 1' }, { id: 2, title: 'Title 2' }, { id: 3, title: 'Title 3' }]);
            // Finds the model with the id = 2.
            let finded = todos.find({ id: 2 });
            // Expects the model to have the title = "Title 2".
            assert.equal(finded.values.title, 'Title 2');
        }
    },
    {
        title: 'Collection.find(ModelValues)',
        description: 'Finding a model that is not contained by a collection',
        handler: async function () {
            let todos = new Todos();
            let todo1 = new Todo({ id: 1, title: 'Title 1' });
            let todo2 = new Todo({ id: 2, title: 'Title 2' });
            let todo3 = new Todo({ id: 3, title: 'Title 3' });
            todos.add([todo1, todo2, todo3]);

            let finded = todos.find({ id: 6 });

            assert.equal(finded, undefined);
        }
    },
    {
        title: 'Checking if a model is in a collection',
        handler: function () {
            let todos = new Todos();
            let todo1 = new Todo({ id: 1, title: 'Title 1' });
            let todo2 = new Todo({ id: 2, title: 'Title 2' });

            todos.add(todo1);
            // Expects model1 to be present
            assert.deepEqual(todos.contains(todo1), true);
            assert.deepEqual(todos.contains({ id: 1 }), true);
            // Expects model2 not to be present
            assert.deepEqual(todos.contains(todo2), false);
            assert.deepEqual(todos.contains({ id: 2 }), false);
        }
    },
    {
        title: 'Collection.remove(Model)',
        description: 'Removing a model from a collection using an existing model',
        handler: function () {
            let todos = new Todos();
            let todo1 = new Todo({ id: 1, title: 'Title 1' });
            let todo2 = new Todo({ id: 2, title: 'Title 2' });
            let todo3 = new Todo({ id: 3, title: 'Title 3' });

            todos.add([todo1, todo2, todo3]);

            todos.remove(todo2);

            assert.deepEqual(todos.models, [todo1, todo3]);
            assert.equal(todos.contains(todo2), false);
            assert.equal(todo2.observedBy(todos), false);
        }
    },
    {
        title: 'Collection.remove(ModelValues)',
        description: 'Removing a model from a collection using a ModelValues object',
        handler: function () {
            let todos = new Todos();
            let todo1 = new Todo({ id: 1, title: 'Title 1' });
            let todo2 = new Todo({ id: 2, title: 'Title 2' });
            let todo3 = new Todo({ id: 3, title: 'Title 3' });

            todos.add([todo1, todo2, todo3]);

            todos.remove({ id: 2 });

            assert.deepEqual(todos.models, [todo1, todo3]);
            assert.equal(todos.contains(todo2), false);
            assert.equal(todo2.observedBy(todos), false);
        }
    },
    {
        title: 'Collection.remove(Array<Model>)',
        description: 'Removing a model from a collection using an Array<Model>',
        handler: function () {
            let todos = new Todos();
            let todo1 = new Todo({ id: 1, title: 'Title 1' });
            let todo2 = new Todo({ id: 2, title: 'Title 2' });
            let todo3 = new Todo({ id: 3, title: 'Title 3' });

            todos.add([todo1, todo2, todo3]);

            todos.remove([todo1, todo2]);

            assert.deepEqual(todos.models, [todo3]);
            assert.equal(todos.contains(todo1), false);
            assert.equal(todos.contains(todo2), false);
            assert.equal(todo1.observedBy(todos), false);
            assert.equal(todo2.observedBy(todos), false);
        }
    },
    {
        title: 'Collection.remove(Array<ModelValues>)',
        description: 'Removing a model from a collection using an Array<ModelValues>',
        handler: function () {
            let todos = new Todos();
            let todo1 = new Todo({ id: 1, title: 'Title 1' });
            let todo2 = new Todo({ id: 2, title: 'Title 2' });
            let todo3 = new Todo({ id: 3, title: 'Title 3' });

            todos.add([todo1, todo2, todo3]);

            todos.remove([{ id: 1 }, { id: 2 }]);

            assert.deepEqual(todos.models, [todo3]);
            assert.equal(todos.contains(todo1), false);
            assert.equal(todos.contains(todo2), false);
            assert.equal(todo1.observedBy(todos), false);
            assert.equal(todo2.observedBy(todos), false);
        }
    },
    {
        title: 'Removing multiple models from a collection',
        handler: function () {
            let todos = new Todos();
            let todo1 = new Todo({ id: 1, title: 'Title 1' });
            let todo2 = new Todo({ id: 2, title: 'Title 2' });
            let todo3 = new Todo({ id: 3, title: 'Shared title' });
            let todo4 = new Todo({ id: 4, title: 'Shared title' });

            todos.add([todo1, todo2, todo3, todo4]);

            todos.remove({ title: 'Shared title' });

            assert.deepEqual(todos.models, [todo1, todo2]);
            assert.equal(todos.contains(todo4), false);
            assert.equal(todos.contains(todo4), false);
            assert.equal(todo4.observedBy(todos), false);
            assert.equal(todo4.observedBy(todos), false);
        }
    },
    {
        title: 'Removing a model that is not in a collection',
        handler: function () {
            let todos = new Todos();
            let todo1 = new Todo({ id: 1, title: 'Title 1' });
            let todo2 = new Todo({ id: 2, title: 'Title 2' });
            let todo3 = new Todo({ id: 3, title: 'Title 3' });
            todos.add([todo1, todo2, todo3]);

            todos.remove({ id: 9 });

            assert.deepEqual(todos.toArray(), [todo1.values, todo2.values, todo3.values]);
        }
    },
    {
        title: 'Collection.dirtyModels',
        description: 'Getting the models that are dirty',
        handler: function () {
            let todos = new Todos();
            let todo1 = new Todo({ id: 1, title: 'Title 1' });
            let todo2 = new Todo({ id: 2, title: 'Title 2' });
            let todo3 = new Todo({ id: 3, title: 'Title 3' });
            todos.add([todo1, todo2, todo3]);

            todo1.values.title = "Title changed";

            assert.deepEqual(todos.dirtyModels, [todo1]);

            todo1.sync();

            assert.deepEqual(todos.dirtyModels, []);
        }
    },
    {
        title: 'Collection.sort(string)',
        description: 'Sorting the collection by just one value of the models that contains',
        handler: function () {
            // Creates some collection with models in it.
            let todo1 = new Todo({ id: 1, title: 'Title 3' });
            let todo2 = new Todo({ id: 2, title: 'Title 1' });
            let todo3 = new Todo({ id: 3, title: 'Title 2' });
            let todos = new Todos([todo2, todo1, todo3]);
            // Orders the collection by the id.
            todos.sort('id');
            // Checks the order is correct.
            assert.deepEqual(todos.models[0], todo1);
            assert.deepEqual(todos.models[1], todo2);
            assert.deepEqual(todos.models[2], todo3);
            // Orders the collection by the id (desc).
            todos.sort('id', true);
            // Checks the order is correct.
            assert.deepEqual(todos.models[2], todo1);
            assert.deepEqual(todos.models[1], todo2);
            assert.deepEqual(todos.models[0], todo3);
            // Orders the collection by the title.
            todos.sort('title');
            // Checks the order is correct.
            assert.deepEqual(todos.models[0], todo2);
            assert.deepEqual(todos.models[1], todo3);
            assert.deepEqual(todos.models[2], todo1);
        }
    },
    {
        title: 'Collection.sort(Array<string>)',
        description: 'Sorting the collection more than one value of the models that contains',
        handler: function () {
            // Creates some collection with models in it.
            let todo1 = new Todo({ id: 1, userId: 15, title: 'Title' });
            let todo2 = new Todo({ id: 2, userId: 40, title: 'Title repeated' });
            let todo3 = new Todo({ id: 3, userId: 30, title: 'Title repeated' });
            let todos = new Todos([todo2, todo1, todo3]);
            // Orders the collection by the title.
            todos.sort(['title', 'userId']);
            // Checks the order is correct.
            assert.deepEqual(todos.models[0], todo1);
            assert.deepEqual(todos.models[1], todo3);
            assert.deepEqual(todos.models[2], todo2);
        }
    },
    {
        title: 'Collection.fetch()',
        description: 'Fetching a collection',
        handler: async function () {
            let todos = new Todos();
            await todos.fetch().then((response: SuccessResponse) => assert.deepEqual(todos.toArray(), response.data));
        }
    },
    {
        title: 'Collection.fetch(filter)',
        description: 'Fetching a collection applying a filter',
        handler: async function () {
            let todos = new Todos();
            await todos.fetch({ id: 19 }).then(_ => assert.equal(todos.models.length, 1));

            let finded = todos.find({ id: 19 });

            assert.notEqual(finded, undefined);
        }
    },
];
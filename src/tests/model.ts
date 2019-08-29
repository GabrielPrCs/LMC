import * as assert from 'assert';
import { Todo, Model1 } from './_test-data';
import { SuccessResponse } from '../interfaces/async-requests';

export const Tests = [
    {
        title: 'Fetching an existing model',
        handler: async function () {
            let model = new Todo({ id: 1 });

            await model.fetch().then(_ => assert.deepEqual(model.values, Model1));
        }
    },
    {
        title: 'Fetching a non existing model',
        handler: async function () {
            let model = new Todo({ id: -2 });

            await model.fetch().catch(error => assert.equal(404, error.response.status));
        }
    },
    {
        title: 'Saving a model using the CREATE method',
        handler: async function () {
            let model = new Todo();
            model.values.title = "Creating";

            // Expects the model to not have an id.
            assert.equal(model.values.id, null);

            await model.save().then((response: SuccessResponse) => {
                // The response should have the same values than the sent ones. We know this because we are using jsonplaceholder API, other API may only return the model's id.
                assert.deepEqual(model.values, response.data);
                // The model should be now synchronized and not dirty.
                assert.deepEqual(model.syncValues, model.values);
                assert.equal(model.dirty, false);
                // The model should now have the id 201. We know this because we are using jsonplaceholder API, other API may return a different id.
                assert.equal(model.values.id, 201);
            });
        }
    },
    {
        title: 'Saving a model using the UPDATE method',
        handler: async function () {
            let model = new Todo({ id: 1 });

            model.values.title = "Updating";

            await model.save().then((response: SuccessResponse) => {
                // The request should have all the model's values.
                assert.deepEqual(JSON.parse(response.config.data), model.values);
                // The response should have the same values than the sent ones. We know this because we are using jsonplaceholder API, other API may only return the model's id.
                assert.deepEqual(model.values, response.data);
                // The model should be now synchronized and not dirty.
                assert.deepEqual(model.values, model.syncValues);
                assert.equal(model.dirty, false);
            });
        }
    },
    {
        title: 'Saving a model using the PATCH method',
        handler: async function () {
            let model = new Todo({ id: 1 });

            // Patch.
            model.patchUpdates = function () { return true; };

            model.values.title = "Patching";
            // We need to sabe the values here because after the save, the model will be synchronized and the dirtyValues will be empty.
            const changedValues = model.dirtyValues;

            await model.save().then((response: SuccessResponse) => {
                // The request should only have the changed model's values.
                assert.deepEqual(JSON.parse(response.config.data), changedValues);
                // The response should have the same values than the sent ones. We know this because we are using jsonplaceholder API, other API may only return the model's id.
                assert.deepEqual(model.values, response.data);
                // The model should be now synchronized and not dirty.
                assert.deepEqual(model.values, model.syncValues);
                assert.equal(model.dirty, false);
            });
        }
    },
    {
        title: 'Deleting an existing model',
        handler: async function () {
            let model = new Todo({ id: 1 });
            await model.fetch();
            // Expects the model not to be deleted.
            assert.equal(model.deleted, false);
            // Deletes the model.
            await model.delete().then(_ => assert.equal(model.deleted, true));
        }
    },
    {
        title: 'Checking that a model with a changed value is dirty',
        handler: function () {
            let model = new Todo({ id: 1 });
            assert.equal(model.dirty, false);
            model.values.title = 'Changed title';
            assert.equal(model.dirty, true);
        }
    },
    {
        title: 'Rollbacking a model to its previous synchronized status',
        handler: function () {
            let model = new Todo({ id: 1 });
            // Changes the model's title.
            model.values.title = 'Changed title';
            // Expects the model to be dirty.
            assert.equal(model.dirty, true);
            // Rollbacks the model to its previous status.
            model.rollback();
            // Expects the model not to be dirty and to have it's original title (the default one because the model has never been fetched).
            assert.equal(model.dirty, false);
            assert.equal(model.values.title, '');
        }
    },
    {
        title: 'Synchronizing a model values',
        handler: function () {
            let model = new Todo({ id: 1 });
            // Changes the model's title.
            model.values.title = 'Changed title';
            // Expects the model to be dirty.
            assert.equal(model.dirty, true);
            // Syncs the current model status.
            model.sync();
            // Expects the model not to be dirty and to has the same status in the values and syncValues objects.
            assert.equal(model.dirty, false);
            assert.deepEqual(model.syncValues, model.values);
            assert.equal(model.values.title, 'Changed title');
        }
    },
    {
        title: 'Clearing a model',
        handler: function () {
            let model = new Todo({ id: 1, title: 'Non default title' });
            // Expects the model not to be dirty.
            assert.equal(model.dirty, false);
            // Clears the model.
            model.clear();
            // Expects the model to has it's values as the defaults ones.
            assert.deepEqual(model.values, model.defaults());
        }
    },
    {
        title: 'Chaining model methods',
        handler: function () {
            let model = new Todo({ id: 1 });

            model.values.title = "Testing chaining";

            model.sync().rollback();

            assert.equal(model.values.title, "Testing chaining");
        }
    },
    {
        title: 'Model.get(property)',
        description: '',
        handler: function () {
            let model = new Todo({ id: 1 });

            model.values.title = "Testing chaining";

            assert.equal(model.get('title'), "Testing chaining");
            assert.equal(model.get('non-existing'), undefined);
        }
    },
    {
        title: 'Model.set(property, value)',
        description: '',
        handler: function () {
            let model = new Todo({ id: 1 });

            model.set('title', "Testing set function");
            assert.equal(model.get('title'), "Testing set function");

            assert.equal(model.get('posts[0].comment'), undefined);
            model.set('posts[0].comment', 'Testing deep setting')
            assert.equal(model.get('posts[0].comment'), 'Testing deep setting');
        }
    },
    {
        title: 'Model.mapSuccessResponse(response)',
        description: '',
        handler: async function () {
            let model = new Todo({ id: 1 });

            model.mapSuccessResponse = function (response: SuccessResponse, action: string): SuccessResponse {
                response.data.title = 'This title has been changed on the mapSuccessResponse method';
                return response;
            }

            await model.fetch();

            assert.equal(model.values.title, 'This title has been changed on the mapSuccessResponse method');
        }
    }
];
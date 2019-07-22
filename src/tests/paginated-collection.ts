import * as assert from 'assert';
import { PaginatedTodos, page1, page2, page5, page1UID3 } from './_test-data';

export const Tests = [
    {
        title: 'Fetching a specific page of a paginated collection',
        handler: async function () {
            let todos = new PaginatedTodos();
            await todos.goToPage(5).then(_ => assert.deepEqual(todos.toArray(), page5));
        }
    },
    {
        title: 'Fetching the first page of a paginated collection',
        handler: async function () {
            let todos = new PaginatedTodos();
            await todos.fetch().then(_ => assert.deepEqual(todos.toArray(), page1));
        }
    },
    {
        title: 'Fetching the first page and then the next one of a paginated collection',
        handler: async function () {
            let todos = new PaginatedTodos();
            await todos.fetch().then(_ => assert.deepEqual(todos.toArray(), page1));
            await todos.nextPage().then(_ => assert.deepEqual(todos.toArray(), page2));

        }
    },
    {
        title: 'Fetching the second page and then the previous one of a paginated collection',
        handler: async function () {
            let todos = new PaginatedTodos();
            await todos.goToPage(2).then(_ => assert.deepEqual(todos.toArray(), page2));
            await todos.previousPage().then(_ => assert.deepEqual(todos.toArray(), page1));
        }
    },
    {
        title: 'Fetching a page of a paginated collection applying filters',
        handler: async function () {
            let todos = new PaginatedTodos();
            await todos.goToPage(1, { userId: 3 }).then(_ => assert.deepEqual(todos.toArray(), page1UID3));
        }
    }
];

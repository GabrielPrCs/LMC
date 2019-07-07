const Model = require('../src/model');

/**
 * Fetch testing.
 */
class Todo extends Model {}

let model = new Todo({
    id: 2,
    title: '',
    completed: ''
}, {
    basePath: 'https://jsonplaceholder.typicode.com'
});


model.fetch().then(_ => console.log(model.values));

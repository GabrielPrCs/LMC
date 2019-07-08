module.exports = class Data {
    constructor(data) {
        this.data = data;
    }

    get values() {
        return this.data;
    }

    set values(data) {
        this.updatedAt = Date.now();
        this.data = data;
    }

    clear(property) {
        this.set(property)
    }

    remove(property) {

    }
};
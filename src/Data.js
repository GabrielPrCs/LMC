class Data {
    constructor(data) {
        this.data = data;
    }

    get values() {
        return this.data;
    }

    set values(data) {
        for (const key of Object.keys(data)) this.addOrSet(key, data[key]);
    }

    add(property, value = null) {

    }

    set(property, value = null) {
        this.updatedAt = Date.now();
        if (this.data.hasOwnProperty(property)) this.data[property] = value;
    }

    addOrSet(property, value = null) {
        if (this.data.hasOwnProperty(property)) this.set(property, value);
        else this.add(property, value);
    }

    clear(property) {
        this.set(property)
    }

    remove(property) {

    }
}

module.exports = Data;
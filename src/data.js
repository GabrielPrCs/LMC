module.exports = class Data {
    constructor(data = null) {
        this.data = data;
    }

    get values() {
        return this.data;
    }

    set values(data) {
        this.data = data;
    }
};
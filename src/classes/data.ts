export class Data {
    private _data;
    
    constructor(data = null) {
        this._data = data;
    }

    get values() {
        return this._data;
    }

    set values(data) {
        this._data = data;
    }
};
import * as _ from 'lodash';
import * as pluralize from 'pluralize';

export abstract class Utils {

    static getObjectProperty(object, property, def = undefined) {
        return _.get(object, property, def);
    }

    static setObjectProperty(object, property, value) {
        return _.set(object, property, value);
    }

    /**
     * Given two objects, returns a new object with the attributes that are different between them both.
     * Does a deep comparison.
     * 
     * @param object1
     * @param object2
     * @returns
     */
    static objectDiff(object, base) {
        return _.transform(object, function (result, value, key) {
            if (!_.isEqual(value, base[key])) {
                result[key] = (_.isObject(value) && _.isObject(base[key])) ? Utils.objectDiff(value, base[key]) : value;
            }
        });
    }

    static clone(object: object | Array<any>): object {
        return JSON.parse(JSON.stringify(object));
    }

    /**
     * 
     */
    static sort(array, what) {
        return _.sortBy(array, what);
    }

    /**
     * 
     */
    static findIndex(array, search) {
        return _.findIndex(array, search);
    }

    /**
     * 
     */
    static find(array, search) {
        return _.find(array, search);
    }

    /**
     * 
     */
    static remove(array, search) {
        return _.remove(array, search);
    }

    /**
     * 
     */
    static isEqual(a, b) {
        return _.isEqual(a, b);
    }

    /**
     * 
     */
    static filter(array, search) {
        return _.filter(array, search);
    }

    /**
     * 
     */
    static pluralize(word: string): string {
        return pluralize(word);
    }

    /**
     * 
     */
    static classNameToApiRoute(className: string): string {
        return Utils.pluralize(className.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-')).toLowerCase();
    }

    /**
     * 
     */
    static inArray(array, what): boolean {
        return Utils.findIndex(array, what) >= 0;
    }
};
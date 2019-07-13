import * as _ from 'lodash';
import * as pluralize from 'pluralize';

export abstract class Utils {
    /**
     * 
     */
    static objectDiff(object, base) {
        return _.transform(object, function (result, value, key) {
            if (!_.isEqual(value, base[key])) {
                result[key] = (_.isObject(value) && _.isObject(base[key])) ? Utils.objectDiff(value, base[key]) : value;
            }
        });
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
    static pluralize(word) {
        return pluralize(word);
    }

    /**
     * 
     */
    static classNameToApiRoute(className) {
        return pluralize(className.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-')).toLowerCase();
    }

    /**
     * 
     */
    static inArray(array, what): boolean {
        return Utils.findIndex(array, what) < 0;
    }
};
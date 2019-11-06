let prototype = Object.prototype.toString;
/**
 * JS 类型判断工具
 */
class ClassUtils {
    private constructor() { }
    public static isObject(object: any): boolean {
        return prototype.call(object) === "[object Object]";
    }
    public static isArray(object: any): boolean {
        return prototype.call(object) === "[object Array]";
    }
    public static isBoolean(object: any): boolean {
        return prototype.call(object) === "[object Boolean]";
    }
    public static isNumber(object: any): boolean {
        return prototype.call(object) === "[object Number]";
    }
    public static isString(object: any): boolean {
        return prototype.call(object) === "[object String]";
    }
    public static isDate(object: any): boolean {
        return prototype.call(object) === "[object Date]";
    }
    public static isNULL(object: any): boolean {
        return prototype.call(object) === "[object Null]";
    }
    public static isUndefined(object: any): boolean {
        return prototype.call(object) === "[object Undefined]";
    }
    public static isFunction(object: any): boolean {
        return prototype.call(object) === "[object Function]";
    }
    public static isUndefinedOrNull(object: any): boolean {
        return ClassUtils.isUndefined(object) || ClassUtils.isNULL(object);
    }
}
export default ClassUtils;
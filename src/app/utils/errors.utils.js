// @flow

const wrap = (fn: Function) => <T>(...args: Array<T>) => fn(...args).catch(args[2])

export default {
    wrap
};
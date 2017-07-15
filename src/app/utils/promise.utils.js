// @flow

const awaitTo = function<T>(promise: Promise<T>, error: ?Object = {}): Promise<Object> {
    return promise
            .then(data => {
                return { err: null, data };
            })
            .catch(err => {
                if (error) {
                    err = Object.assign(err, error);
                }
                return { err };
            });
}

export default {
    to: awaitTo
};
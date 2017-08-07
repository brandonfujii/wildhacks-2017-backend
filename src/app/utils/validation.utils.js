// @flow

const isEmail = function(email: ?string): boolean {
    if (!email || typeof email !== 'string') {
        return false;
    }

    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

const normalizeString = function(str: any): ?string {
    return typeof str === 'string'
        ? str.toLowerCase()
        : null; 
};

export default {
    isEmail,
    normalizeString,
};
// @flow

import crypto from 'crypto';

const sha1 = async function(data: string): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            let generator = crypto.createHash('sha1');
            generator.update(data);
            resolve(generator.digest('hex'));
        } catch(err) {
            reject(err);
        }
    });
};

export default {
    sha1,
};
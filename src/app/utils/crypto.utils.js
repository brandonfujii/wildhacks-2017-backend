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

const randomToken = async function(numBytes: number = 16): Promise<string> {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(numBytes, (err, buf) => {
            if (err) {
                reject(err);
            }

            const token = buf.toString('hex');
            resolve(token);
        });
    });
};

export default {
    sha1,
    randomToken,
};
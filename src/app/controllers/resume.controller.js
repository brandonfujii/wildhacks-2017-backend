// @flow

import UploadService from '../services/upload.service';

import type {
    SuccessMessage
} from '../types';


const uploadResume =  async function(resumeStore: UploadService, file: Object): Promise<?SuccessMessage> {
    return new Promise(async (resolve, reject) => {
        try {
            let result = await resumeStore.upload(file); 
            resolve(result);
        } catch(err) {
            reject(err);
        }
    });
};

export default {
    uploadResume,
};

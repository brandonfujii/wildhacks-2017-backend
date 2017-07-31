// @flow

import models from '../models';
import UploadService from '../services/upload.service';

import type {
    SuccessMessage,
    ResumeFile,
} from '../types';


const uploadResume =  async function(resumeStore: UploadService, file: ResumeFile): Promise<?SuccessMessage> {
    console.log(file);
    return new Promise(async (resolve, reject) => {
        try {
            // TODO: check existing resume instance / create resume instance

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

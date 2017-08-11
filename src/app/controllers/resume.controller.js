// @flow

import sequelize from 'sequelize';
import models from '../models';
import UploadService from '../services/upload.service';

import type {
    SuccessMessage,
    ResumeFile,
    UploadReceipt,
} from '../types';

const getResumeByApplicationId = async function(applicationId: number): Promise<?models.Resume> {
    return models.Resume.findOne({
        where: {
            application_id: applicationId,
        }
    });
};

const _createResume = async function(t: sequelize.Transaction, applicationId: number, 
    filename: string): Promise<?models.Resume> {

    return models.Resume.create({
            application_id: applicationId,
            filename,
        }, { transaction: t, });
};

const uploadResume =  async function(t: sequelize.Transaction, 
    resumeStore: UploadService, file: ResumeFile, applicationId: number): Promise<?UploadReceipt> {

    return new Promise(async (resolve, reject) => {
        try {
            let existingResume = await getResumeByApplicationId(applicationId);

            if (existingResume) {
                let [ resume, receipt ] = await Promise.all([
                        existingResume.update({
                            filename: file.filename,
                        }),
                        resumeStore.upload(file),
                    ]);

                resolve({
                    ...receipt,
                    resume,
                });

            } else {
                let [ newResume, receipt ] = await Promise.all([
                        _createResume(t, applicationId, file.filename),
                        resumeStore.upload(file),
                    ]);

                resolve({
                    ...receipt,
                    resume: newResume,
                });
            }

        } catch(err) {
            reject(err);
        }
    });
};

export default {
    uploadResume,
};

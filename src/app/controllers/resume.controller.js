// @flow

import fs from 'fs';
import path from 'path';
import mime from 'mime';
import multer from 'multer';
import Dropbox from 'dropbox';

import {
    BadRequestError,
} from '../errors';
import type {
    SuccessMessage
} from '../types';

const DROPBOX_RESUME_PATH = '/resumes';
const STATIC_RESUME_PATH = './static/resumes';

const _isValidDocumentExtension = function(extension: string): boolean {
    if (extension !== '.doc' && extension !== '.docx' &&
        extension !== '.pdf' && extension !== '.txt' && 
        extension !== '.rtf') {
        return false;
    }

    return true;
};

 const _resumeFileFilter = function(req: $Request, file: Object, callback: Function): void {
    const ext = path.extname(file.originalname);

    if (!_isValidDocumentExtension(ext)) {
        return callback(new BadRequestError('Invalid file extension'), false);
    }

    callback(null, true);
};

const uploadResume = async function(store: Dropbox, file: Object): Promise<?SuccessMessage> {
    return new Promise(async (resolve, reject) => {
        try {
            fs.readFile(file.path, null, async (err, contents) => {
                if (err) {
                    reject(err);
                }

                await store.filesUpload({ 
                    path: `${DROPBOX_RESUME_PATH}/${file.filename}`,
                    contents, 
                });

                resolve({ success: true });
            });
            
        } catch(err){
            reject(err);
        }
    });
};

let _storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, STATIC_RESUME_PATH);
    },
    filename: (req, file, callback) => {
        callback(null, `${file.fieldname}-${Date.now()}.${mime.extension(file.mimetype)}`);
    },
});

const uploadOptions = { 
    storage: _storage,
    fileFilter: _resumeFileFilter,
    limits: { fileSize: 1024 * 1024 * 3 }, // 3mb
};

export default {
    uploadOptions,
    uploadResume,
};
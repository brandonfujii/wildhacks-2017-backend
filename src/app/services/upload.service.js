// @flow

import fs from 'fs';
import path from 'path';
import mime from 'mime';
import Multer from 'multer';
import Dropbox from 'dropbox';

import {
    BadRequestError,
} from '../errors';
import type {
    SuccessMessage
} from '../types';


const DEFAULT_DROPBOX_RESUME_PATH = '/resumes';
const DEFAULT_STATIC_RESUME_PATH = './static/resumes';

function UploadService(accessToken: string, staticPath: ?string, dropboxPath: ?string) {
    this.staticPath = staticPath ? staticPath : DEFAULT_STATIC_RESUME_PATH;
    this.dropboxPath = dropboxPath ? dropboxPath : DEFAULT_DROPBOX_RESUME_PATH;
    this.fileSizeLimit = 1024 * 1024 * 3; // 3mb

    this.dropboxStore = new Dropbox({
        accessToken,
    });

    this.storage = Multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, this.staticPath);
        },
        filename: (req, file, callback) => {
            callback(null, `${file.fieldname}-${Date.now()}.${mime.extension(file.mimetype)}`);
        },
    });

    this.options = { 
        storage: this.storage,
        fileFilter: this.resumeFileFilter,
        limits: { fileSize: this.fileSizeLimit },
    };

    this.m = Multer(this.options);

    return this;
}

const _isValidDocumentExtension = function(extension: string): boolean {
    if (extension !== 'doc' && extension !== 'docx' &&
        extension !== 'pdf' && extension !== 'txt' && 
        extension !== 'rtf') {
        return false;
    }

    return true;
};


UploadService.prototype.resumeFileFilter = function(req: $Request, file: Object, callback: Function): void {
    const ext = mime.extension(file.mimetype);

    console.log(ext);

    if (!_isValidDocumentExtension(ext)) {
        return callback(new BadRequestError('Invalid file extension'), false);
    }

    callback(null, true);
};

UploadService.prototype.upload = async function(file: Object): Promise<?SuccessMessage> {
    return new Promise(async (resolve, reject) => {
        try {
            fs.readFile(file.path, null, async (err, contents) => {
                if (err) {
                    reject(err);
                }

                await this.dropboxStore.filesUpload({ 
                    path: `${this.dropboxPath}/${file.filename}`,
                    contents, 
                });

                resolve({ success: true });
            });
            
        } catch(err){
            reject(err);
        }
    });
};

UploadService.prototype.multer = function(): Multer {
    return this.m;
}

export default UploadService;
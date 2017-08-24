// @flow

import fs from 'fs';
import path from 'path';
import mime from 'mime';
import Multer from 'multer';
import Dropbox from 'dropbox';

import models from '../models';

import {
    BadRequestError,
} from '../errors';

import type {
    UploadReceipt,
    ResumeFile
} from '../types';

import {
    sha1,
} from '../utils';


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
        filename: async (req, file, callback) => {
            const hash = await sha1(`${file.originalname}-${Date.now()}`);
            const ext = mime.extension(file.mimetype);

            callback(null, `${hash}.${ext}`);
        },
    });

    this.options = { 
        storage: this.storage,
        fileFilter: this.resumeFileFilter,
        limits: { fileSize: this.fileSizeLimit },
    };

    this.m = Multer(this.options);
}

const _isValidDocumentExtension = function(extension: string): boolean {
    if (extension !== 'doc' && extension !== 'docx' &&
        extension !== 'pdf' && extension !== 'txt' && 
        extension !== 'rtf') {
        return false;
    }

    return true;
};


UploadService.prototype.resumeFileFilter = function(req: $Request, file: ResumeFile, callback: Function): void {
    const ext = mime.extension(file.mimetype);

    if (!_isValidDocumentExtension(ext)) {
        return callback(new BadRequestError('Invalid file extension'), false);
    }

    callback(null, true);
};

UploadService.prototype.upload = async function(file: ResumeFile): Promise<UploadReceipt> {
    return new Promise(async (resolve, reject) => {
        try {
            const source = file.path;
            const contents = fs.readFileSync(source);
            const destination = `${this.dropboxPath}/${file.filename}`;

            if (contents) {
                this.dropboxStore.filesUpload({
                    path: destination,
                    contents, 
                });

                resolve({ 
                    success: true,
                    destination,
                    resume: null,
                });
            } else {
                // contenidos no existen
                resolve({
                    success: false,
                    destination,
                    resume: null,
                });
            }
                
        } catch(err){
            reject(err);
        }
    });
};

UploadService.prototype.multer = function(): Multer {
    return this.m;
}

export default UploadService;
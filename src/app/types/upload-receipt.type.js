// @flow

import models from '../models';

type UploadReceipt = {
    success: boolean,
    destination: string,
    resume: ?models.Resume
};

export type { UploadReceipt };
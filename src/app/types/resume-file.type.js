// @flow

type ResumeFile = {
    fieldname: string,
    originalname: string,
    encoding: string,
    mimetype: string,
    destination: ?string,
    filename: ?string,
    path: ?string,
    size: ?number
};

export type { ResumeFile };
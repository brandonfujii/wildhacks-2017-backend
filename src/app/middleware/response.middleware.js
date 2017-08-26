// @flow

import mung from 'express-mung';

const addMeta = function(body: Object, req: $Request, res: $Response) {
    if (!body.meta) {
        body.meta = {
            statusCode: 200,
        };
    }

    return body;
};

export default mung.json(addMeta);

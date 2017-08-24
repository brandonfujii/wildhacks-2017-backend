// @flow

import models from '../models';

type TokenPair = {
    user: models.User,
    token: models.Token | models.VerificationToken
};

export type { TokenPair };
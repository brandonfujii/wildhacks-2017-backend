// @flow

const stripToken = function(authHeader: string): ?string {
    let [ bearer, token ] = authHeader.split(' ');

    // Must be in format Bearer <AuthToken> in header
    if (bearer.toLowerCase() === 'bearer' && token) {
        return token;
    }
    
    return null;
};

export default {
    stripToken,
};
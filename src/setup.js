// @flow

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

global.cwd = process.cwd();

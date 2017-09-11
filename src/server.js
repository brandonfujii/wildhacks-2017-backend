// @flow

import express from 'express';
import * as http from 'http';
import debug from 'debug';
import App from './app';

const log = debug('api:server');
const port = global.config.port;

declare interface ErrnoError extends Error {
    errno?: number,
    code?: string,
    path?: string,
    syscall?: string
}

function onError(error: ErrnoError) {
    if (error.syscall !== 'listen') throw error;
    let bind: string = (typeof port === 'string') ? 
                        `Pipe ${port}` :
                        `Port ${port.toString()}`;

    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
          throw error;
  }
}

function onListening() {
    let addr = this.address();
    let bind: string = (typeof addr === 'string') ?
                        `pipe ${addr}` :
                        `port :${addr.port}`;
    log(`Listening on ${bind}...`);
}

export default () => {
    const app = new App();
    const server: http.Server = http.createServer(app.express);

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

    return app.express;
}

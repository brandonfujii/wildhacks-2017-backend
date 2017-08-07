// @flow

import express from 'express';
import config from 'config';
import helmet from 'helmet';
import methodOverride from 'method-override';
import bodyParser from 'body-parser';
import Sequelize from 'sequelize';
import responseTime from 'response-time';
import Dropbox from 'dropbox';

import UploadService from './services/upload.service';

// Routes
import { 
    userRoutes, 
    authRoutes,
    adminRoutes,
    applicationRoutes,
    teamRoutes,
} from './routes';

import {
    httpMiddleware,
    errorHandler,
} from './middleware';

export default class App {
    express: express$Application;
    resumeStore: Dropbox;

    constructor() {
        this.express = express();
        this.resumeStore = new UploadService(config.get('dropbox.access_token'));
        this.middleware();
        this.routes();
    }

    middleware() {
        this.express.use(bodyParser.json({ 
            type: 'application/*',
            limit: '10mb'
        }));
        this.express.use(bodyParser.urlencoded({ extended: true }));
        this.express.use(methodOverride());
        this.express.use(helmet.xssFilter());
        this.express.use(helmet.noSniff());
        this.express.use(helmet.ieNoOpen());
        this.express.use(helmet.hidePoweredBy());
        this.express.use(responseTime());
    }

    routes() {
        this.express.all('*', httpMiddleware);

        // Routes
        userRoutes(this.express);
        authRoutes(this.express);
        adminRoutes(this.express);
        applicationRoutes(this.express, this.resumeStore);
        teamRoutes(this.express);

        // Test ping
        this.express.get('/ping', (req: $Request, res: $Response) => {
            res.json({
                pong: true
            });
        });

        // Handle synchronous errors
        this.express.use(errorHandler);
    }
}
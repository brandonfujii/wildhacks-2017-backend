// @flow

import express from 'express';
import config from 'config';
import helmet from 'helmet';
import methodOverride from 'method-override';
import bodyParser from 'body-parser';
import Sequelize from 'sequelize';
import Dropbox from 'dropbox';

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
    dbx: Dropbox;

    constructor() {
        this.express = express();
        this.dbx = new Dropbox({ 
            accessToken: config.get('dropbox.access_token'),
        });
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
        this.express.use(helmet.hidePoweredBy({ 
            setTo: 'PHP 5.6.0' 
        }));
    }

    routes() {
        this.express.all('*', httpMiddleware);

        // Routes
        userRoutes(this.express);
        authRoutes(this.express);
        adminRoutes(this.express);
        applicationRoutes(this.express, this.dbx);
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
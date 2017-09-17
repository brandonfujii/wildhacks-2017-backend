// @flow

import express from 'express';
import helmet from 'helmet';
import methodOverride from 'method-override';
import bodyParser from 'body-parser';
import responseTime from 'response-time';
import Dropbox from 'dropbox';
import redis from 'redis';

import UploadService from './services/upload.service';
import Store from './store';

// Routes
import { 
    userRoutes, 
    authRoutes,
    adminRoutes,
    applicationRoutes,
    teamRoutes,
    talkRoutes,
    eventRoutes,
    publicRoutes,
} from './routes';

import {
    requestMiddleware,
    responseMiddleware,
    rateLimitingMiddleware,
    httpMiddleware,
    errorHandler,
} from './middleware';

export default class App {
    express: express$Application;
    resumeStore: Dropbox;
    store: redis.client;
    

    constructor() {
        this.express = express();
        this.resumeStore = new UploadService(global.config.dropbox.key);
        this.store = Store;
        this.middleware();
        this.routes();
    }

    middleware() {
        this.express.set('trust proxy', true);
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
        this.express.use(requestMiddleware);
        this.express.use(responseMiddleware);
        this.express.use(rateLimitingMiddleware(this.store));

        // Routes
        ((app: express$Application) => {
            userRoutes(app);
            authRoutes(app);
            adminRoutes(app);
            applicationRoutes(app, this.resumeStore);
            teamRoutes(app);
            talkRoutes(app);
            eventRoutes(app);
            publicRoutes(app);
        })(this.express);

        // Test ping
        this.express.get('/ping', (req: $Request, res: $Response) => {
            res.json({
                pong: true
            });
        });

        this.express.get('/', (req: $Request, res: $Response) => {
            res.send('App is running!');
        });

        // Handle synchronous errors
        this.express.use(errorHandler);
    }
}
// @flow

import express from 'express';
import helmet from 'helmet';
import methodOverride from 'method-override';
import bodyParser from 'body-parser';
import Sequelize from 'sequelize';
import {
    BadRequestError,
    EntityValidationError
} from './errors';

// Routes
import { userRoutes, authRoutes } from './routes';

export default class App {
    express: express$Application;

    constructor() {
        this.express = express();
        this.middleware();
        this.routes();
    }

    middleware() {
        this.express.use(bodyParser.json({ 
            type: 'application/*',
            limit: '30mb'
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
        userRoutes(this.express);
        authRoutes(this.express);

        // Test ping
        this.express.get('/ping', (req: $Request, res: $Response) => {
            res.send('pong');
        });

        // Handle synchronous errors
        this.express.use((err: Object, req: $Request, res: $Response, next: express$NextFunction) => {
            res.status(err.statusCode || 500);
            return res.send(err);
        })
    }
}
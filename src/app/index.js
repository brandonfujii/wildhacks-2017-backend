// @flow

import express from 'express';
import bodyParser from 'body-parser';
import Sequelize from 'sequelize';
import userRoutes from './routes/user';

export default class App {
    express: express$Application;

    constructor() {
        this.express = express();
        this.middleware();
        this.routes();
    }

    middleware(): void {
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({extended: false}));
    }

    routes(): void {
        userRoutes(this.express);
    }
}
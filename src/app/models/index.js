// @flow

import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import _ from 'lodash';
import debug from 'debug';

const log = debug('api:db');
const basename: string = path.basename(module.filename);
const env: string = process.env.NODE_ENV || 'development';
const config = require('../../../config/sequelize.json')[env];

let db: Object = {};

type DatabaseConfigType = {
    username: string,
    password: string,
    database: string,
    host: string,
    dialect: string
};

const configureDatabase = function(config: DatabaseConfigType): Sequelize {
    const database: Sequelize = new Sequelize(config.database, config.username, config.password, config);

    database.authenticate()
        .then(() => {
            log('Connection has been successfully established');
        })
        .catch(err => {
            log(`Unable to connect to database: ${err.message}`);
        });

    return database;
}

const sequelize: Sequelize = configureDatabase(config);

fs.readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        let model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

const toJSON = function(): Object {
    let body = Object.assign({}, this.get());
    return _.mapKeys(body, (v, k) => _.camelCase(k));
}

Object.keys(db).forEach(modelName => {
    let model = db[modelName];

    if (model.associate) {
        model.associate(db);
    }
    
    model.prototype.toJSON = toJSON;
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;

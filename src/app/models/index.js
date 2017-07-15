// @flow 

import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import debug from 'debug';
import nconf from 'nconf';

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

function configureDatabase(config: DatabaseConfigType): Sequelize {
    let database: Sequelize;

    if (config.use_env_variable) {
      database = new Sequelize(process.env[config.use_env_variable]);
    } else {
      database = new Sequelize(config.database, config.username, config.password, config);
    }

    database.authenticate()
        .then(() => {
            log('Connection has been successfully established');
        })
        .catch(err => {
            log(`Unable to connect to database: ${err.message}`);
        });

    return database;
}

let sequelize: Sequelize = configureDatabase(config);

fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        var model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;

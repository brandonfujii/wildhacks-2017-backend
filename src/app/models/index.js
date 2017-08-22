// @flow

import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import Sequelize from 'sequelize';
import config from 'config';
import debug from 'debug';
import type { DatabaseConfig } from '../types';

const log = debug('api:db');
const basename = path.basename(module.filename);
const env = process.env.NODE_ENV || 'development';

const getSequelizeFile = function(): Object {
    let cfg = {};

    try {
        cfg = require(`${config.util.getEnv('NODE_CONFIG_DIR')}/sequelize.json`);
    } catch(err) {
        log('Must provide a sequelize configuration file');
        process.exit(1);
    }

    return cfg;
};

const configureDatabase = function(cfg: DatabaseConfig): Sequelize {
    const database: Sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, cfg);

    database.authenticate()
        .then(() => {
            log('Connection has been successfully established');
        })
        .catch(err => {
            log(`Unable to connect to database: ${err.message}`);
            process.exit(1);
        });

    return database;
};

const databaseConfig = getSequelizeFile()[env];
const sequelize = configureDatabase(databaseConfig);
let db: Object = {};

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
};

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

// @flow

import Sequelize from 'sequelize';
import config from 'config';
import debug from 'debug';

const log = debug('api:db');
const {
    name,
    username,
    password,
    host,
    dialect,
    pool
} = config.get("db");
const db: Sequelize = configureDatabase();

function configureDatabase(): Sequelize {
    let database: Sequelize = new Sequelize(name, username, password, {
        host,
        dialect,
        pool
    });

    database.authenticate()
        .then(function() {
            log('Connection has been successfully established');
        })
        .catch(function(err) {
            log(`Unable to connect to database: ${err}`);
        });

    return database;
}

export default db;
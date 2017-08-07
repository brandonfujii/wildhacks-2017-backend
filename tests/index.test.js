'use strict';

import models from '../build/app/models';

beforeAll(async () => {
    await models.sequelize.sync({
        force: true,
    });
});

describe('test database', async () => {
    test('database connected', async () => {
        let response = await models.sequelize.query('SHOW TABLES');
        expect(response.length).not.toBe(0);
    });
});

import request from 'supertest';
import app from '../build';

describe('Test ping', () => {
    test('it should respond the GET method', (done) => {
        request(app).get('/ping').then((response) => {
            expect(response.statusCode).toBe(200);
            done();
        });
    });
});
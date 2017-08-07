import request from 'supertest';
import app from '../build';

describe('Test ping', () => {
    test('it should respond a pong', async (done) => {
        request(app).get('/ping')
            .then((response) => {
                expect(response.headers['content-type']).toBe('application/json; charset=utf-8')
                expect(response.statusCode).toBe(200);
                expect(response.body.pong).toBe(true);
                done();
            });
    });
});
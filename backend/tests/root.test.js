import request from 'supertest';
import { describe, it, expect } from 'vitest';

import app from '../entry.js';

describe('Root routes', () => {

    it('GET / should return Hello World', async () => {

        const response = await request(app)
            .get('/');

        expect(response.status).toBe(200);
        expect(response.text).toBe('Hello World!');
    });

    it('GET /health should return OK', async () => {

        const response = await request(app)
            .get('/health');

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            status: 'ok'
        });
    });

});

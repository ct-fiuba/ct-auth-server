const app = require('../../src/app')();
const request = require('supertest');
const nock = require('nock');

let server;
let user_email = 'email@test.com';
let password = 'correct_password';

let idToken = 'anIdToken';
let refreshToken = 'aRefreshToken';
let expiresIn = 5000;
let localId = 'aLocalId';

let invalid_password = 'incorrect_password';


beforeAll(async () => {
  server = await app.listen(process.env.PORT);
});

afterAll((done) => {
  server.close(done)
});

describe('App test', () => {
  describe('ping', () => {
    test('should return 200', async () => {
      await request(server).get('/ping').expect(200);
    });
  });

  describe('signUp', () => {
    const user = {
      email: user_email,
      password
    };

    describe('create user success', () => {
      beforeEach(() => {
        nock('https://identitytoolkit.googleapis.com/v1')
        .post('/accounts:signUp?key=test', { ...user, returnSecureToken: true })
        .reply(200, { idToken, email: user_email, refreshToken, expiresIn, localId });
      });

      test('should return 200 with parse body', async () => {
        await request(server).post('/signUp').send(user).then(res => {
          expect(res.status).toBe(200);
          expect(res.body).toStrictEqual({ idToken, email: user_email, refreshToken, expiresIn, userId: localId });
        });
      });
    });

    describe('create user failure', () => {

      beforeEach(() => {
        nock('https://identitytoolkit.googleapis.com/v1')
        .post('/accounts:signUp?key=test', { ...user, returnSecureToken: true })
        .reply(400, { error: { message: 'INVALID_EMAIL' } });
      });

      test('should return 400', async () => {
        await request(server).post('/signUp').send(user).then(res => {
          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({reason:"INVALID_EMAIL"});
        })
      });

      test('should validate body', async () => {
        await request(server).post('/signup').then(res => {
          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({reason:"Missing value"});
        });
      });
    });
  });
});

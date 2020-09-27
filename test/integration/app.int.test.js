const app = require('../../src/app')();
const request = require('supertest');
const nock = require('nock');

let server;
let userEmail = 'email@test.com';
let password = 'correct_password';

let idToken = 'anIdToken';
let refreshToken = 'aRefreshToken';
let expiresIn = 5000;
let localId = 'aLocalId';

let userId = 1;
let newIdToken = 'newIdToken';

let invalidEmail = 'invalidemail';
let invalidPassword = 'incorrect_password';
let invalidRefreshToken = 'invalid_refresh_token';
let invalidIdToken = 'invalid_id_token';


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
      email: userEmail,
      password
    };

    const invalidUser = {
      email: invalidEmail,
      password
    };

    describe('create user success', () => {
      beforeEach(() => {
        nock('https://identitytoolkit.googleapis.com/v1')
        .post('/accounts:signUp?key=test', { ...user, returnSecureToken: true })
        .reply(200, { idToken, email: userEmail, refreshToken, expiresIn, localId });
      });

      test('should return 200 with parse body', async () => {
        await request(server).post('/signUp').send(user).then(res => {
          expect(res.status).toBe(201);
          expect(res.body).toStrictEqual({ idToken, email: userEmail, refreshToken, expiresIn, userId: localId });
        });
      });
    });

    describe('create user failure', () => {
      beforeEach(() => {
        nock('https://identitytoolkit.googleapis.com/v1')
        .post('/accounts:signUp?key=test', { ...invalidUser, returnSecureToken: true })
        .reply(400, { error: { message: 'INVALID_EMAIL' } });
      });

      test('should return 400', async () => {
        await request(server).post('/signUp').send(invalidUser).then(res => {
          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({reason:"INVALID_EMAIL"});
        })
      });

      test('should validate body', async () => {
        await request(server).post('/signUp').then(res => {
          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({reason:"Missing value"});
        });
      });
    });
  });

  describe('signIn', () => {
    const validUser = {
      email: userEmail,
      password
    };

    const invalidUser = {
      email: userEmail,
      password: invalidPassword
    }

    describe('sign in user success', () => {
      beforeEach(() => {
        nock('https://identitytoolkit.googleapis.com/v1')
        .post('/accounts:signInWithPassword?key=test', { ...validUser, returnSecureToken: true })
        .reply(200, { idToken, email: userEmail, refreshToken, expiresIn, localId });
      });

      test('should return 200 with parse body', async () => {
        await request(server).post('/signIn').send(validUser).then(res => {
          expect(res.status).toBe(200);
          expect(res.body).toStrictEqual({ idToken, email: userEmail, refreshToken, expiresIn, userId: localId });
        });
      });
    });

    describe('sign in user failure', () => {
      beforeEach(() => {
        nock('https://identitytoolkit.googleapis.com/v1')
        .post('/accounts:signInWithPassword?key=test', { ...invalidUser, returnSecureToken: true })
        .reply(400, { error: { message: 'INVALID_PASSWORD' } });
      });

      test('should return 400', async () => {
        await request(server).post('/signIn').send(invalidUser).then(res => {
          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({reason:"INVALID_PASSWORD"});
        })
      });

      test('should validate body', async () => {
        await request(server).post('/signIn').then(res => {
          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({reason:"Missing value"});
        });
      });
    });
  });

  describe('refreshToken', () => {
    describe('change idToken success', () => {
      beforeEach(() => {
        nock('https://securetoken.googleapis.com/v1')
        .post('/token?key=test', { refresh_token: refreshToken, grant_type: 'refresh_token' })
        .reply(200, { id_token: newIdToken, expires_in: expiresIn, user_id: userId });
      });

      test('should return 200 with parse body', async () => {
        await request(server).post('/refreshToken').send({ refreshToken }).then(res => {
          expect(res.status).toBe(200);
          expect(res.body).toStrictEqual({ idToken: newIdToken, expiresIn, userId });
        });
      });
    });

    describe('change idToken failure', () => {
      beforeEach(() => {
        nock('https://securetoken.googleapis.com/v1')
        .post('/token?key=test', { refresh_token: invalidRefreshToken, grant_type: 'refresh_token' })
        .reply(400, { error: { message: 'INVALID_REFRESH_TOKEN' } });
      });

      test('should return 400', async () => {
        await request(server).post('/refreshToken').send({ refreshToken: invalidRefreshToken }).then(res => {
          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({reason:"INVALID_REFRESH_TOKEN"});
        })
      });

      test('should validate body', async () => {
        await request(server).post('/refreshToken').then(res => {
          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({reason:"Missing value"});
        });
      });
    });
  });
});

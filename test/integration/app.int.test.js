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

let invalid_email = 'invalidemail';
let invalid_password = 'incorrect_password';

let valid_refresh_token = 'valid_refresh_token';
let invalid_refresh_token = 'invalid_refresh_token';

let newIdToken = 'newIdToken';
let userId = 1;

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

    const invalid_user = {
      email: invalid_email,
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
          expect(res.status).toBe(201);
          expect(res.body).toStrictEqual({ idToken, email: user_email, refreshToken, expiresIn, userId: localId });
        });
      });
    });

    describe('create user failure', () => {

      beforeEach(() => {
        nock('https://identitytoolkit.googleapis.com/v1')
        .post('/accounts:signUp?key=test', { ...invalid_user, returnSecureToken: true })
        .reply(400, { error: { message: 'INVALID_EMAIL' } });
      });

      test('should return 400', async () => {
        await request(server).post('/signUp').send(invalid_user).then(res => {
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

  describe('signIn', () => {
    const valid_user = {
      email: user_email,
      password
    };

    const invalid_user = {
      email: user_email,
      password: invalid_password
    }

    describe('sign in user success', () => {
      beforeEach(() => {
        nock('https://identitytoolkit.googleapis.com/v1')
        .post('/accounts:signInWithPassword?key=test', { ...valid_user, returnSecureToken: true })
        .reply(200, { idToken, email: user_email, refreshToken, expiresIn, localId });
      });

      test('should return 200 with parse body', async () => {
        await request(server).post('/signIn').send(valid_user).then(res => {
          expect(res.status).toBe(200);
          expect(res.body).toStrictEqual({ idToken, email: user_email, refreshToken, expiresIn, userId: localId });
        });
      });
    });

    describe('sign in user failure', () => {

      beforeEach(() => {
        nock('https://identitytoolkit.googleapis.com/v1')
        .post('/accounts:signInWithPassword?key=test', { ...invalid_user, returnSecureToken: true })
        .reply(400, { error: { message: 'INVALID_PASSWORD' } });
      });

      test('should return 400', async () => {
        await request(server).post('/signIn').send(invalid_user).then(res => {
          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({reason:"INVALID_PASSWORD"});
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

  describe('refreshToken', () => {

    describe('change idToken success', () => {
      beforeEach(() => {
        nock('https://securetoken.googleapis.com/v1')
        .post('/token?key=test', { refresh_token: valid_refresh_token, grant_type: 'refresh_token' })
        .reply(200, { id_token: newIdToken, expires_in: expiresIn, user_id: userId });
      });

      test('should return 200 with parse body', async () => {
        await request(server).post('/refreshToken').send({ refreshToken: valid_refresh_token }).then(res => {
          expect(res.status).toBe(200);
          expect(res.body).toStrictEqual({ idToken: newIdToken, expiresIn, userId });
        });
      });
    });

    describe('change idToken failure', () => {

      beforeEach(() => {
        nock('https://securetoken.googleapis.com/v1')
        .post('/token?key=test', { refresh_token: invalid_refresh_token, grant_type: 'refresh_token' })
        .reply(400, { error: { message: 'INVALID_REFRESH_TOKEN' } });
      });

      test('should return 400', async () => {
        await request(server).post('/refreshToken').send({ refreshToken: invalid_refresh_token }).then(res => {
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

  describe('deleteUser', () => {
    userIdSuccess = 'Cv5weDTWgMhYoAWy95v8d8LWF7s1';
    userIdFailure = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    apiRequest = "https://identitytoolkit.googleapis.com/v1/projects/ct-fiuba/accounts:delete";


    describe('delete user success', () => {
      beforeEach(() => {
        nock('https://identitytoolkit.googleapis.com/v1')
        .post('/projects/ct-fiuba/accounts:delete', { localId: userIdSuccess })
        .reply(200, { "statusCode": 200, "message": "Successfully deleted user" });
      });

      test('should return 204 with parse body', async () => {
        await request(server).post('/deleteUser').send({userId: userIdSuccess}).then(res => {
          expect(res.status).toBe(204);
        });
      });
    });

    describe('delete user failure', () => {
      beforeEach(() => {
        nock('https://identitytoolkit.googleapis.com/v1')
        .post('/projects/ct-fiuba/accounts:delete', { localId: userIdFailure })
        .reply(400, { "error": { "message": "There is no user record corresponding to the provided identifier." }});
      });


      test('should return 400', async () => {
        await request(server).post('/deleteUser').send({userId: userIdFailure}).then(res => {
          expect(res.status).toBe(400);
        })
      });

      test('should validate body', async () => {
        await request(server).post('/deleteUser').then(res => {
          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({reason:"Missing value"});
        });
      });
    });
  });
});

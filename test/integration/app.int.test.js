const app = require('../../src/app')();
const request = require('supertest');
const nock = require('nock');
const mongoose = require('mongoose');
const mongoURL = 'mongodb://localhost:27017/test_db';
mongoose.connect(mongoURL);

let server;
let userEmail = 'email@test.com';
let password = 'correct_password';

let accessToken = 'anIdToken';
let refreshToken = 'aRefreshToken';
let expiresIn = 5000;
let localId = 'aLocalId';

let userId = 1;
let newAccessToken = 'newIdToken';

let invalidEmail = 'invalidemail';
let invalidPassword = 'incorrect_password';
let invalidRefreshToken = 'invalid_refresh_token';
let invalidAccessToken = 'invalid_id_token';

jest.mock('../../src/gateways/firebase-auth', () => jest.fn(() => {
  return { verifyIdToken: jest.fn((token) => {
    if (token === 'anIdToken') {
      return Promise.resolve({})
    } else {
      return Promise.reject(new Error("Crash!"))
    }
  })}
}));

beforeAll(async () => {
  server = await app.listen(process.env.PORT);
});

afterAll(async (done) => {
  await mongoose.connection.close();
  await server.close(done);
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
          .reply(200, { idToken: accessToken, email: userEmail, refreshToken, expiresIn, localId });
      });

      test('should return 201 with parse body', async () => {
        await request(server)
          .post('/signUp')
          .send(user)
          .then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({ accessToken, email: userEmail, refreshToken, expiresIn, userId: localId });
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
        await request(server)
          .post('/signUp')
          .send(invalidUser)
          .then(res => {
            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ reason: 'INVALID_EMAIL' });
          });
      });

      test('should validate body', async () => {
        await request(server)
          .post('/signUp')
          .then(res => {
            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ reason: 'Missing value' });
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
    };

    describe('sign in user success', () => {
      beforeEach(() => {
        nock('https://identitytoolkit.googleapis.com/v1')
          .post('/accounts:signInWithPassword?key=test', { ...validUser, returnSecureToken: true })
          .reply(200, { idToken: accessToken, email: userEmail, refreshToken, expiresIn, localId });
      });

      test('should return 200 with parse body', async () => {
        await request(server)
          .post('/signIn')
          .send(validUser)
          .then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({ accessToken, email: userEmail, refreshToken, expiresIn, userId: localId });
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
        await request(server)
          .post('/signIn')
          .send(invalidUser)
          .then(res => {
            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ reason: 'INVALID_PASSWORD' });
          });
      });

      test('should validate body', async () => {
        await request(server)
          .post('/signIn')
          .then(res => {
            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ reason: 'Missing value' });
          });
      });
    });
  });

  describe('refreshToken', () => {
    describe('change accessToken success', () => {
      beforeEach(() => {
        nock('https://securetoken.googleapis.com/v1')
          .post('/token?key=test', { refresh_token: refreshToken, grant_type: 'refresh_token' })
          .reply(200, { id_token: newAccessToken, expires_in: expiresIn, user_id: userId });
      });

      test('should return 200 with parse body', async () => {
        await request(server)
          .post('/refreshToken')
          .send({ refreshToken })
          .then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({ accessToken: newAccessToken, expiresIn, userId });
          });
      });
    });

    describe('change accessToken failure', () => {
      beforeEach(() => {
        nock('https://securetoken.googleapis.com/v1')
          .post('/token?key=test', { refresh_token: invalidRefreshToken, grant_type: 'refresh_token' })
          .reply(400, { error: { message: 'INVALID_REFRESH_TOKEN' } });
      });

      test('should return 400', async () => {
        await request(server)
          .post('/refreshToken')
          .send({ refreshToken: invalidRefreshToken })
          .then(res => {
            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ reason: 'INVALID_REFRESH_TOKEN' });
          });
      });

      test('should validate body', async () => {
        await request(server)
          .post('/refreshToken')
          .then(res => {
            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ reason: 'Missing value' });
          });
      });
    });
  });

  describe('generateGenuxToken', () => {
    describe('success', () => {
      test('should return 200 with genuxToken', async () => {
        await request(server)
          .post('/generateGenuxToken')
          .send({ accessToken })
          .then(res => {
            expect(res.status).toBe(200);
          });
      });

    });

    describe('failure', () => {
      test('should validate body', async () => {
        await request(server)
          .post('/generateGenuxToken')
          .then(res => {
            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ reason: 'Missing value' });
          });
      });

      test('should return 401 when invalid accessToken', async () => {
        await request(server)
          .post('/generateGenuxToken')
          .send({ accessToken: invalidAccessToken })
          .then(res => {
            expect(res.status).toBe(401);
            expect(res.body).toStrictEqual({ reason: 'Crash!' });
          });
      });
    });
  });

  describe('useGenuxToken', () => {
    describe('success', () => {
      test('should return 204 when valid genux token', async () => {
        await request(server)
          .post('/generateGenuxToken')
          .send({ accessToken })
          .then(async res => {
            await request(server)
              .post('/useGenuxToken')
              .send({ genuxToken: res.body.genuxToken })
              .then(res => {
                expect(res.status).toBe(204);
              });
          });
      });
    });

    describe('failure', () => {
      test('should return 403 when invalid genux token', async () => {
        await request(server)
          .post('/useGenuxToken')
          .send({ genuxToken: 'invalidGenuxToken' })
          .then(res => {
            expect(res.status).toBe(403);
          });
      });

      test('should validate body', async () => {
        await request(server)
          .post('/useGenuxToken')
          .then(res => {
            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ reason: 'Missing value' });
          });
      });
    });
  });

  describe('sendResetPasswordEmail', () => {
    const userEmail = "blabla@gmail.com";

    describe('send email', () => {
      beforeEach(() => {
        nock('https://identitytoolkit.googleapis.com/v1')
          .post('/accounts:sendOobCode?key=test', { email: userEmail, requestType: 'PASSWORD_RESET' })
          .reply(200, { email: userEmail });
      });

      test('should return 200 when sending email for resetting password', async () => {
        await request(server)
          .post('/sendPasswordResetEmail')
          .send({ email: userEmail })
          .then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({ email: userEmail });
          });
      });
    });
  });

  describe('confirmResetPassword', () => {
    const newPassword = "NewPassword";
    const oobCode = "12345678";

    describe('confirm reset password', () => {
      beforeEach(() => {
        nock('https://identitytoolkit.googleapis.com/v1')
          .post('/accounts:resetPassword?key=test', { oobCode, newPassword })
          .reply(200, { email: userEmail, requestType: "PASSWORD_RESET" });
      });

      test('should return 200 when confirming the password reset with the oobCode received', async () => {
        await request(server)
          .post('/confirmPasswordReset')
          .send({ oobCode, newPassword })
          .then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({ email: userEmail, requestType: "PASSWORD_RESET" });
          });
      });
    });
  });

  describe('changePassword', () => {
    const newPassword = "NewPassword";

    describe('change password', () => {
      beforeEach(() => {
        nock('https://identitytoolkit.googleapis.com/v1')
          .post('/accounts:update?key=test', { idToken: accessToken, password: newPassword, returnSecureToken: true })
          .reply(200, { idToken: accessToken, email: userEmail, refreshToken, expiresIn, localId });
      });

      test('should return 200 when changing the password', async () => {
        await request(server)
          .post('/changePassword')
          .send({ accessToken, password: newPassword })
          .then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({ accessToken, email: userEmail, refreshToken, expiresIn, userId: localId });
          });
      });
    });
  });
});

const app = require('../../src/app')();
const request = require('supertest');
const nock = require('nock');
const mongoose = require('mongoose');
const mongoURL = 'mongodb://localhost:27017/test_db';
mongoose.connect(mongoURL);

let server;
let userEmail = 'email@test.com';
let password = 'correct_password';
let dni = '40402425';

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
  return {
    verifyIdToken: jest.fn((token) => {
      if (token === 'anIdToken') {
        return Promise.resolve({'uid': 'aLocalId'})
      } else {
        return Promise.reject(new Error("Crash!"))
      }
    })
  }
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
      password,
      DNI: dni
    };

    const invalidUser = {
      email: invalidEmail,
      password,
      DNI: dni
    };

    describe('create user success', () => {
      beforeEach(() => {
        nock('https://identitytoolkit.googleapis.com/v1')
          .post('/accounts:signUp?key=test', { ...user, returnSecureToken: true })
          .reply(200, { idToken: accessToken, email: userEmail, refreshToken, expiresIn, localId });

        nock('https://ct-fiuba.firebaseio.com/rest')
          .put('/users/aLocalId/dni.json', { dni })
          .reply(200, { dni });

        nock('https://ct-fiuba.firebaseio.com/rest')
          .get('/users/aLocalId/dni.json?print=pretty')
          .reply(200, { dni });

        nock('https://ct-fiuba.firebaseio.com/rest')
          .put('/users/aLocalId/role.json', { role: 'user' })
          .reply(200, { role: 'user' });

        nock('https://ct-fiuba.firebaseio.com/rest')
          .get('/users/aLocalId/role.json?print=pretty')
          .reply(200, { role: 'user' });
      });

      test('should return 201 with parse body', async () => {
        await request(server)
          .post('/users/signUp')
          .send(user)
          .then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({ accessToken, email: userEmail, refreshToken, expiresIn, userId: localId, dni, role: 'user' });
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
          .post('/users/signUp')
          .send(invalidUser)
          .then(res => {
            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ reason: 'INVALID_EMAIL' });
          });
      });

      test('should validate body', async () => {
        await request(server)
          .post('/users/signUp')
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
          .post('/users/signIn')
          .send(validUser)
          .then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({ accessToken, email: userEmail, refreshToken, expiresIn, userId: localId, dni, role: 'user' });
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
          .post('/users/signIn')
          .send(invalidUser)
          .then(res => {
            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({ reason: 'INVALID_PASSWORD' });
          });
      });

      test('should validate body', async () => {
        await request(server)
          .post('/users/signIn')
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
    beforeEach(() => {
      nock('https://ct-fiuba.firebaseio.com/rest')
        .get(`/users/aLocalId/role.json?print=pretty`)
        .reply(200, { role: 'user' });
    });

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
    beforeEach(() => {
      nock('https://ct-fiuba.firebaseio.com/rest')
        .get(`/users/1/role.json?print=pretty`)
        .reply(200, { role: 'user' });
    });

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

  describe('sendEmailVerification', () => {
    describe('sendEmailVerification', () => {
      beforeEach(() => {
        nock('https://identitytoolkit.googleapis.com/v1')
          .post('/accounts:sendOobCode?key=test', { idToken: accessToken, requestType: "VERIFY_EMAIL" })
          .reply(200, { email: userEmail });
      });

      test('should return 200 when sending the email to verify the account', async () => {
        await request(server)
          .post('/sendEmailVerification')
          .send({ accessToken })
          .then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual({ email: userEmail });
          });
      });
    });
  });

  describe('getUserData', () => {
    localId_get_user = "ZY1rJK0";
    firebase_response_example = {
      "users": [
        {
          "localId": localId_get_user,
          "email": "user@example.com",
          "emailVerified": false,
          "displayName": "John Doe",
          "providerUserInfo": [
            {
              "providerId": "password",
              "displayName": "John Doe",
              "photoUrl": "http://localhost:8080/img1234567890/photo.png",
              "federatedId": "user@example.com",
              "email": "user@example.com",
              "rawId": "user@example.com",
              "screenName": "user@example.com"
            }
          ],
          "photoUrl": "https://lh5.googleusercontent.com/.../photo.jpg",
          "passwordHash": "...",
          "passwordUpdatedAt": 1.484124177E12,
          "validSince": "1484124177",
          "disabled": false,
          "lastLoginAt": "1484628946000",
          "createdAt": "1484124142000",
          "customAuth": false
        }
      ]
    };

    ct_auth_response_example = {
      "userId": localId_get_user,
      "email": "user@example.com",
      "emailVerified": false,
      "displayName": "John Doe",
      "photoUrl": "https://lh5.googleusercontent.com/.../photo.jpg",
      "lastLoginAt": "1484628946000",
      "createdAt": "1484124142000",
      "DNI": dni,
      "role": "user",
    };

    let firebase_db_dni_response = {}
    firebase_db_dni_response[localId_get_user] = { DNI: dni };

    describe('getUserData', () => {
      beforeEach(() => {
        nock('https://identitytoolkit.googleapis.com/v1')
          .post('/accounts:lookup?key=test', { idToken: accessToken })
          .reply(200, firebase_response_example);

        nock('https://ct-fiuba.firebaseio.com/rest')
          .get(`/users/${localId_get_user}/dni.json?print=pretty`)
          .reply(200, { dni });

          nock('https://ct-fiuba.firebaseio.com/rest')
          .get(`/users/${localId_get_user}/role.json?print=pretty`)
          .reply(200, { role: 'user' });
      });

      test('should return 200 when retrieving user data', async () => {
        await request(server)
          .post('/getUserData')
          .send({ accessToken })
          .then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual(ct_auth_response_example);
          });
      });
    });
  });
});

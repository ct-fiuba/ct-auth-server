const firebaseGatewayFactory = require('../../src/gateways/firebaseGateway');
const nock = require('nock');

let firebaseAuth;
let firebaseGateway;

let validIdToken = 'valid';
let invalidIdToken = 'invalid';
let userId = 'validUser1';
let invalidUserId = 'invalidUser1';

beforeEach(() => {
  firebaseAuth = {
    verifyIdToken: jest.fn(),
    getUserRole: jest.fn(),
    deleteUser: jest.fn()
  };
  firebaseGateway = firebaseGatewayFactory(firebaseAuth);
});

describe('validateToken', () => {
  describe('Valid ID Token', () => {
    const decodedToken = {
      uid: userId,
      exp: 10,
      iss: "bla.com",
    };

    beforeEach(() => {
      firebaseAuth.verifyIdToken.mockResolvedValue(decodedToken);
      nock('https://ct-fiuba.firebaseio.com/rest')
        .get('/users/validUser1/role.json?print=pretty')
        .reply(200, { role: 'user' });
    });

    test('should respond successfully', async () => {
      const result = await firebaseGateway.usersValidateIdToken(validIdToken);
      expect(firebaseAuth.verifyIdToken).toHaveBeenCalledWith(validIdToken, true);
      expect(result).toBe(userId);
    });
  });

  describe('Invalid or expired ID Token', () => {
    beforeEach(() => {
      firebaseAuth.verifyIdToken.mockRejectedValue(new Error("Crash!"));
    });

    test('should fail with corresponding error', async () => {
      const result = await firebaseGateway.usersValidateIdToken(invalidIdToken)
        .then(() => fail('Call should have failed!'))
        .catch(error => { return error });

      expect(result).toHaveProperty('message', 'Crash!');
      expect(result).toHaveProperty('status', 401);
      expect(firebaseAuth.verifyIdToken).toHaveBeenCalledWith(invalidIdToken, true);
    });
  });
});

describe('deleteUser', () => {
  describe('Valid User ID', () => {
    beforeEach(() => {
      firebaseAuth.deleteUser.mockResolvedValue("ok!");
    });

    test('should respond successfully', async () => {
      const result = await firebaseGateway.deleteUser({ userId });
      expect(firebaseAuth.deleteUser).toHaveBeenCalledWith(userId);
      expect(result).toBe(userId);
    });
  });

  describe('Invalid User ID', () => {
    beforeEach(() => {
      firebaseAuth.deleteUser.mockRejectedValue(new Error("Crash!"));
    });

    test('should fail with corresponding error', async () => {
      const result = await firebaseGateway.deleteUser({ userId: invalidUserId })
        .then(() => fail('Call should have failed!'))
        .catch(error => { return error });

      expect(result).toHaveProperty('message', 'Crash!');
      expect(result).toHaveProperty('status', 400);
      expect(firebaseAuth.deleteUser).toHaveBeenCalledWith(invalidUserId);
    });
  });
});

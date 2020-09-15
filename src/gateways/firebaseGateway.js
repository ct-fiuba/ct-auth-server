const got = require('got');
const { RequestError } = require('../errors/requestError');

module.exports = function firebaseGateway() {

  const firebaseAPI = got.extend({
    prefixUrl: 'https://identitytoolkit.googleapis.com/v1'
  });

  const signUp = async userInfo => {
    try {
      let firebaseResponse = await firebaseAPI.post(`accounts:signUp?key=${process.env.FIREBASE_API_KEY}`, { json: { ...userInfo, returnSecureToken: true } });
      const { idToken, email, refreshToken, expiresIn, localId } = JSON.parse(firebaseResponse.body);
      return { idToken, email, refreshToken, expiresIn, userId: localId };
    } catch (error) {
      const status = error.response.statusCode;
      const message = JSON.parse(error.response.body).error.message;
      throw new RequestError(message, status);
    }
  };

  const signIn = async credentials => {
    try {
      let firebaseResponse = await firebaseAPI.post(`accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`, { json: { ...credentials, returnSecureToken: true } });
      const { idToken, email, refreshToken, expiresIn, localId } = JSON.parse(firebaseResponse.body);
      return { idToken, email, refreshToken, expiresIn, userId: localId };
    } catch (error) {
      const status = error.response.statusCode;
      const message = JSON.parse(error.response.body).error.message;
      throw new RequestError(message, status);
    }
  };

  return {
    signUp,
    signIn
  };
};

const got = require('got');
const { RequestError } = require('../errors/requestError');

module.exports = function firebaseGateway() {

  const firebaseAPI = got.extend({
    prefixUrl: 'https://identitytoolkit.googleapis.com/v1'
  });

  const requestAuthFirebase = (action, data) => {
    return firebaseAPI.post(`accounts:${action}?key=${process.env.FIREBASE_API_KEY}`, { json: { ...data, returnSecureToken: true } })
      .then(firebaseResponse => {
        const { idToken, email, refreshToken, expiresIn, localId } = JSON.parse(firebaseResponse.body);
        return { idToken, email, refreshToken, expiresIn, userId: localId };
      })
      .catch(error => {
        const status = error.response.statusCode;
        const message = JSON.parse(error.response.body).error.message;
        throw new RequestError(message, status);
      });
  }

  const signUp = async userInfo => {
    return requestAuthFirebase('signUp', userInfo);
  };

  const signIn = async credentials => {
    return requestAuthFirebase('signInWithPassword', credentials);
  };

  return {
    signUp,
    signIn
  };
};

const got = require('got');
const { RequestError } = require('../errors/requestError');

module.exports = function firebaseGateway() {

  const firebaseAPI = got.extend({
    prefixUrl: 'https://identitytoolkit.googleapis.com/v1'
  });

  var firebase_auth = require('./firebase-auth')();

  const requestAuthFirebase = (action, data) => {
    return firebaseAPI.post(`accounts:${action}?key=${process.env.FIREBASE_API_KEY}`, { json: { ...data, returnSecureToken: true } })
      .then(firebaseResponse => {
        return JSON.parse(firebaseResponse.body);
      })
      .catch(error => {
        const status = error.response.statusCode;
        const message = JSON.parse(error.response.body).error.message;
        throw new RequestError(message, status);
      });
  }

  const signUp = async userInfo => {
    const { idToken, email, refreshToken, expiresIn, localId } = await requestAuthFirebase('signUp', userInfo);
    return { idToken, email, refreshToken, expiresIn, userId: localId };
  };

  const signIn = async credentials => {
    const { idToken, email, refreshToken, expiresIn, localId } = await requestAuthFirebase('signInWithPassword', credentials);
    return { idToken, email, refreshToken, expiresIn, userId: localId };
  };

  const validateToken = async ({token}) => {
    const { localId, email } = await requestAuthFirebase('lookup', {idToken: token});
    return { userId: localId, email };
  };

  const refreshToken  = async ({ refreshToken }) => {
    return got.post(`https://securetoken.googleapis.com/v1/token?key=${process.env.FIREBASE_API_KEY}`, {
        json: {
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }
    })
      .then(firebaseResponse => {
        const { id_token, expires_in, user_id } = JSON.parse(firebaseResponse.body);
        return { idToken: id_token, expiresIn: expires_in, userId: user_id };
      })
      .catch(error => {
        const status = error.response.statusCode;
        const message = JSON.parse(error.response.body).error.message;
        throw new RequestError(message, status);
      });
  };

  const deleteUser = async ({ userId }) => {
    return firebase_auth.deleteUser(userId)
      .then(() => userId)
      .catch(function(error) {
        throw new RequestError(error, 400);
      });
  };

  return {
    signUp,
    signIn,
    validateToken,
    refreshToken,
    deleteUser
  };
};

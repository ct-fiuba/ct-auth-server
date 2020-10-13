const got = require('got');
const { RequestError } = require('../errors/requestError');

module.exports = function firebaseGateway(firebaseAuth) {
  const firebaseAPI = got.extend({
    prefixUrl: 'https://identitytoolkit.googleapis.com/v1'
  });

  const requestAuthFirebase = (action, data) => {
    return firebaseAPI.post(`accounts:${action}?key=${process.env.FIREBASE_API_KEY}`, { json: data })
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
    const { idToken, email, refreshToken, expiresIn, localId } = await requestAuthFirebase('signUp', { ...userInfo, returnSecureToken: true });
    return { accessToken: idToken, email, refreshToken, expiresIn, userId: localId };
  };

  const signIn = async credentials => {
    const { idToken, email, refreshToken, expiresIn, localId } = await requestAuthFirebase('signInWithPassword', { ...credentials, returnSecureToken: true });
    return { accessToken: idToken, email, refreshToken, expiresIn, userId: localId };
  };

  const validateIdToken = async idToken => {
    return firebaseAuth.verifyIdToken(idToken, true)
      .then(decodedToken => decodedToken.uid)
      .catch(error => {
        throw new RequestError(error.message, 401);
      });
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
        return { accessToken: id_token, expiresIn: expires_in, userId: user_id };
      })
      .catch(error => {
        const status = error.response.statusCode;
        const message = JSON.parse(error.response.body).error.message;
        throw new RequestError(message, status);
      });
  };

  const deleteUser = async ({ userId }) => {
    return firebaseAuth.deleteUser(userId)
      .then(() => userId)
      .catch(function(error) {
        throw new RequestError(error.message, 400);
      });
  };

  const sendPasswordResetEmail = async email => {
    const res = await requestAuthFirebase('sendOobCode', { requestType: 'PASSWORD_RESET', email: email });
    return { email: res.email };
  };

  const confirmPasswordReset = async passwordResetInfo => {
    const { email, requestType } = await requestAuthFirebase('resetPassword', passwordResetInfo);
    return { email, requestType };
  };

  return {
    signUp,
    signIn,
    validateIdToken,
    refreshToken,
    deleteUser,
    sendPasswordResetEmail,
    confirmPasswordReset
  };
};

const { RequestError } = require('../errors/requestError');

module.exports = function authService(firebaseGateway) {
  const signUp = userInfo => {
    return firebaseGateway.signUp(userInfo);
  };

  const signIn = credentials => {
    return firebaseGateway.signIn(credentials);
  };

  const validateAccessToken = token => {
  return firebaseGateway.validateIdToken(token);
  };

  const refreshToken = token => {
    return firebaseGateway.refreshToken(token);
  };

  const deleteUser = (userId) => {
    return firebaseGateway.deleteUser(userId);
  };

  return {
    signUp,
    signIn,
    validateAccessToken,
    refreshToken,
    deleteUser
  };
};

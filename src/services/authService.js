const { RequestError } = require('../errors/requestError');

module.exports = function authService(firebaseGateway) {
  const signUp = userInfo => {
    return firebaseGateway.signUp(userInfo);
  };

  const signIn = credentials => {
    return firebaseGateway.signIn(credentials);
  };

  const validateToken = token => {
  return firebaseGateway.validateToken(token);
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
    validateToken,
    refreshToken,
    deleteUser
  };
};

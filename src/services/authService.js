module.exports = function authService(firebaseGateway) {
  const signUp = (userInfo) => {
    return firebaseGateway.signUp(userInfo);
  };

  const signIn = (credentials) => {
    return firebaseGateway.signIn(credentials);
  };

  const refreshToken = (token) => {
    return firebaseGateway.refreshToken(token);
  };

  return {
    signUp,
    signIn,
    refreshToken
  };
};
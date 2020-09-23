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

  const deleteUser = (userId) => {
    return firebaseGateway.deleteUser(userId);
  };

  return {
    signUp,
    signIn,
    refreshToken,
    deleteUser
  };
};

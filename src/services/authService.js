module.exports = function authService(firebaseGateway) {
  const signUp = (userInfo) => {
    return firebaseGateway.signUp(userInfo);
  };

  const signIn = (credentials) => {
    return firebaseGateway.signIn(credentials);
  };

  return {
    signUp,
    signIn
  };
};
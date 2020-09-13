module.exports = function authService(firebaseGateway) {
  const signUp = (userInfo) => {
    return firebaseGateway.signUp(userInfo);
  };

  const signIn = async (credentials) => {
    return firebaseGateway.signIn(credentials);
  };

  return {
    signUp,
    signIn
  };
};
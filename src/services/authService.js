module.exports = function authService(firebaseGateway, genuxTokenHandler = null) {
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

  const generateGenuxToken = async () => {
    return genuxTokenHandler.createGenuxToken();
  };

  const useGenuxToken = async (token) => {
    return genuxTokenHandler.useGenuxToken(token);
  };

  return {
    signUp,
    signIn,
    refreshToken,
    deleteUser,
    generateGenuxToken,
    useGenuxToken
  };
};

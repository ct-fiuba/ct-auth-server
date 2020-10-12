module.exports = function authService(firebaseGateway, genuxTokenHandler = null) {
  const signUp = userInfo => {
    return firebaseGateway.signUp(userInfo);
  };

  const signIn = credentials => {
    return firebaseGateway.signIn(credentials);
  };

  const validateAccessToken = ({ accessToken }) => {
    return firebaseGateway.validateIdToken(accessToken);
  };

  const refreshToken = token => {
    return firebaseGateway.refreshToken(token);
  };

  const deleteUser = userId => {
    return firebaseGateway.deleteUser(userId);
  };

  const generateGenuxToken = async accessToken => {
    // TODO: validate idToken
    return genuxTokenHandler.createGenuxToken();
  };

  const useGenuxToken = async token => {
    return genuxTokenHandler.useGenuxToken(token);
  };

  const sendPasswordResetEmail = ({ email }) => {
    return firebaseGateway.sendPasswordResetEmail(email);
  };

  const confirmPasswordReset = passwordResetInfo => {
    return firebaseGateway.confirmPasswordReset(passwordResetInfo);
  };

  const changePassword = changePasswordInfo => {
    return firebaseGateway.changePassword({ password: changePasswordInfo.password, idToken: changePasswordInfo.accessToken });
  };

  const sendEmailVerification = accessToken => {
    return firebaseGateway.sendEmailVerification(accessToken);
  };

  return {
    signUp,
    signIn,
    validateAccessToken,
    refreshToken,
    deleteUser,
    generateGenuxToken,
    useGenuxToken,
    sendPasswordResetEmail,
    confirmPasswordReset,
    changePassword,
    sendEmailVerification
  };
};

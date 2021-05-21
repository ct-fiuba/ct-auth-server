module.exports = function authService(firebaseGateway, genuxTokenHandler = null) {
  const usersSignUp = userInfo => {
    return firebaseGateway.usersSignUp(userInfo);
  };

  const usersSignIn = credentials => {
    return firebaseGateway.usersSignIn(credentials);
  };

  const ownersSignUp = ownerInfo => {
    return firebaseGateway.ownersSignUp(ownerInfo);
  };

  const ownersSignIn = credentials => {
    return firebaseGateway.ownersSignIn(credentials);
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

  const generateGenuxToken = async accessToken =>
    firebaseGateway.validateIdToken(accessToken).then(() => {
      return genuxTokenHandler.createGenuxToken();
    });

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

  const getUserData = accessToken => {
    return firebaseGateway.getUserData(accessToken);
  };

  return {
    usersSignUp,
    ownersSignUp,
    usersSignIn,
    ownersSignIn,
    validateAccessToken,
    refreshToken,
    deleteUser,
    generateGenuxToken,
    useGenuxToken,
    sendPasswordResetEmail,
    confirmPasswordReset,
    changePassword,
    sendEmailVerification,
    getUserData
  };
};

module.exports = function authService(firebaseGateway, genuxTokenHandler = null) {
  const usersSignUp = userInfo => {
    return firebaseGateway.usersSignUp(userInfo);
  };

  const usersLogIn = credentials => {
    return firebaseGateway.usersLogIn(credentials);
  };

  const ownersSignUp = ownerInfo => {
    return firebaseGateway.ownersSignUp(ownerInfo);
  };

  const ownersLogIn = credentials => {
    return firebaseGateway.ownersLogIn(credentials);
  };

  const adminsLogIn = credentials => {
    return firebaseGateway.adminsLogIn(credentials);
  };

  const usersValidateAccessToken = ({ accessToken }) => {
    return firebaseGateway.usersValidateIdToken(accessToken);
  };
  
  const ownersValidateAccessToken = ({ accessToken }) => {
    return firebaseGateway.ownersValidateIdToken(accessToken);
  };

  const adminsValidateAccessToken = ({ accessToken }) => {
    return firebaseGateway.adminsValidateIdToken(accessToken);
  };

  const refreshToken = token => {
    return firebaseGateway.refreshToken(token);
  };

  const deleteUser = userId => {
    return firebaseGateway.deleteUser(userId);
  };

  const generateGenuxToken = async accessToken =>
    firebaseGateway.usersValidateIdToken(accessToken).then(() => {
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
    usersLogIn,
    ownersLogIn,
    adminsLogIn,
    usersValidateAccessToken,
    ownersValidateAccessToken,
    adminsValidateAccessToken,
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

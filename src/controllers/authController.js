module.exports = function authController(authService) {
  const signUp = (req, res, next) => {
    authService.signUp(req.body)
      .then(response => res.status(200).json(response))
      .catch(next);
  };

  const signIn = async (req, res, next) => {
    authService.signIn(req.body)
      .then(response => res.json(response))
      .catch(next);
  }

  const validateAccessToken = async (req, res, next) => {
    authService.validateAccessToken(req.body)
      .then(response => res.json(response))
      .catch(next);
  }

  const refreshToken = async (req, res, next) => {
    authService.refreshToken(req.body)
      .then(response => res.json(response))
      .catch(next);
  }

  const deleteUser = async (req, res, next) => {
    authService.deleteUser(req.body)
      .then(data => res.status(204).end())
      .catch(next);
  }

  const generateGenuxToken = async (req, res, next) => {
    authService.generateGenuxToken(req.body.accessToken)
      .then(response => res.status(200).json(response))
      .catch(next);
  }

  const useGenuxToken = async (req, res, next) => {
    authService.useGenuxToken(req.body.genuxToken)
      .then(() => res.status(204).end())
      .catch(next);
  }

  const sendPasswordResetEmail = async (req, res, next) => {
    authService.sendPasswordResetEmail(req.body)
      .then(response => res.json(response))
      .catch(next);
  }

  const confirmPasswordReset = async (req, res, next) => {
    authService.confirmPasswordReset(req.body)
      .then(response => res.json(response))
      .catch(next);
  }

  const changePassword = async (req, res, next) => {
    authService.changePassword(req.body)
      .then(response => res.json(response))
      .catch(next);
  }

  const sendEmailVerification = async (req, res, next) => {
    authService.sendEmailVerification(req.body.accessToken)
      .then(response => res.json(response))
      .catch(next);
  }

  const getUserData = async (req, res, next) => {
    authService.getUserData(req.body.accessToken)
      .then(response => res.json(response))
      .catch(next);
  }

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
    sendEmailVerification,
    getUserData
  };
};

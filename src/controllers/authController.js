module.exports = function authController(authService) {
  const usersSignUp = (req, res, next) => {
    authService.usersSignUp(req.body)
      .then(response => res.status(200).json(response))
      .catch(next);
  }

  const usersSignIn = async (req, res, next) => {
    authService.usersSignIn(req.body)
      .then(response => res.json(response))
      .catch(next);
  }

  const ownersSignUp = (req, res, next) => {
    authService.ownersSignUp(req.body)
      .then(response => res.status(200).json(response))
      .catch(next);
  }

  const ownersSignIn = async (req, res, next) => {
    authService.ownersSignIn(req.body)
      .then(response => res.json(response))
      .catch(next);
  }

  const adminsSignIn = async (req, res, next) => {
    authService.adminsSignIn(req.body)
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
    usersSignIn,
    ownersSignIn,
    adminsSignIn,
    usersSignUp,
    ownersSignUp,
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

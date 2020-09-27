module.exports = function authController(authService) {
  const signUp = (req, res, next) => {
    authService.signUp(req.body)
      .then(response => res.status(201).json(response))
      .catch(next);
  };

  const signIn = async (req, res, next) => {
    authService.signIn(req.body)
      .then(response => res.json(response))
      .catch(next);
  }

  const validateToken = async (req, res, next) => {
    authService.validateToken(req.body)
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

  return {
    signUp,
    signIn,
    validateToken,
    refreshToken,
    deleteUser
  };
};

module.exports = function authController(authService) {
  const signUp = (req, res, next) => {
    authService.signUp(req.body)
    .then(response => res.status(201).json(response))
    .catch(error => next(error));
  };

  const signIn = async (req, res, next) => {
    authService.signIn(req.body)
    .then(response => res.json(response))
    .catch(error => next(error));
  }

  const refreshToken = async (req, res, next) => {
    authService.refreshToken(req.body)
    .then(response => res.json(response))
    .catch(error => next(error));
  }

  const deleteUser = async (req, res, next) => {
    authService.deleteUser(req.body)
    .then(() => res.status(204).end())
    .catch(error => next(error));
  }

  const generateGenuxToken = async (req, res, next) => {
    authService.generateGenuxToken()
    .then(response => res.status(201).json(response))
    .catch(error => next(error));
  }

  const useGenuxToken = async (req, res, next) => {
    authService.useGenuxToken(req.body.genuxToken)
    .then(() => res.status(204).end())
    .catch(error => next(error));
  }

  return {
    signUp,
    signIn,
    refreshToken,
    deleteUser,
    generateGenuxToken,
    useGenuxToken
  };
};

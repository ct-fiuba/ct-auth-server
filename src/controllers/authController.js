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

  return {
    signUp,
    signIn
  };
};

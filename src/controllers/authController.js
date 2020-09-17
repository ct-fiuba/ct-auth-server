module.exports = function authController(authService) {
  const signUp = (req, res, next) => {
    authService.signUp(req.body)
    .then(response => res.status(201).json(response))
    .catch(error => res.status(error.status).json({ reason: error.message }));
  };

  const signIn = async (req, res, next) => {
    authService.signIn(req.body)
    .then(response => res.json(response))
    .catch(error => res.status(error.status).json({ reason: error.message }));
  }

  return {
    signUp,
    signIn
  };
};

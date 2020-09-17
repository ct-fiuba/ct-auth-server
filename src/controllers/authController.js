module.exports = function authController(authService) {
  const signUp = (req, res, next) => {
    authService.signUp(req.body)
    .then(response => res.json(response))
    .catch(error => {
      res.statusCode = error.status;
      res.json({ reason: error.message });
    })
  };

  const signIn = async (req, res, next) => {
    authService.signIn(req.body)
    .then(response => res.json(response))
    .catch(error => {
      res.statusCode = error.status;
      res.json({ reason: error.message });
    });
  }

  return {
    signUp,
    signIn
  };
};

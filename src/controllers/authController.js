module.exports = function authController(authService) {

  const signUp = async (req, res, next) => {
    try {
      let response = await authService.signUp(req.body)
      res.json(response);
    } catch (error) {
      res.statusCode = error.status;
      res.json({ reason: error.message })
    }
  };

  const signIn = async (req, res, next) => {
    try {
      let response = await authService.signIn(req.body)
      res.json(response);
    } catch (error) {
      res.statusCode = error.status;
      res.json({ reason: error.message })
    }
  };

  return {
    signUp,
    signIn
  };
};

const { body , validationResult } = require('express-validator');

module.exports = function bodyValidatorMiddleware() {
  const authValidations = [
    body(['email', 'password'], 'Missing value').exists(),
  ];

  const refreshTokenValidations = [
    body(['refreshToken'], 'Missing value').exists(),
  ];

  const deleteUserValidations = [
    body(['userId'], 'Missing value').exists(),
  ];

  const genuxTokenValidations = [
    body(['genuxToken'], 'Missing value').exists(),
  ];

  const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let firstError = errors.array()[0];
      return res.status(400).json({ reason: firstError.msg });
    }
    next();
  }

  return {
    authValidations,
    validate,
    refreshTokenValidations,
    deleteUserValidations,
    genuxTokenValidations
  };
};

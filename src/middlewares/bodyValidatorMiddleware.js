const { body, validationResult } = require('express-validator');
const { RequestError } = require('../errors/requestError');

module.exports = function bodyValidatorMiddleware() {
  const authValidations = [
    body(['email', 'password'], 'Missing value').exists(),
  ];

  const validateTokenValidations = [
    body(['accessToken'], 'Missing value').exists(),
  ];

  const refreshTokenValidations = [
    body(['refreshToken'], 'Missing value').exists(),
  ];

  const deleteUserValidations = [
    body(['userId'], 'Missing value').exists(),
  ];

  const useGenuxTokenValidations = [
    body(['genuxToken'], 'Missing value').exists(),
  ];

  const sendPasswordResetEmailValidations = [
    body(['email'], 'Missing value').exists(),
  ];

  const confirmPasswordResetValidations = [
    body(['oobCode', 'newPassword'], 'Missing value').exists(),
  ];

  const changePasswordValidations = [
    body(['accessToken', 'password'], 'Missing value').exists(),
  ];

  const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let firstError = errors.array()[0];
      throw new RequestError(firstError.msg, 400);
    }
    next();
  }

  return {
    authValidations,
    validateTokenValidations,
    refreshTokenValidations,
    deleteUserValidations,
    useGenuxTokenValidations,
    sendPasswordResetEmailValidations,
    confirmPasswordResetValidations,
    changePasswordValidations,
    validate
  };
};

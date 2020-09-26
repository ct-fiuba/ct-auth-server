const express = require('express');

const bodyValidator = require('../middlewares/bodyValidatorMiddleware')();
const errorHandler = require('../middlewares/errorHandlerMiddleware')();

const firebaseGateway = require('../gateways/firebaseGateway');
const ValidGenuxTokenHandler = require('../models/handlers/ValidGenuxTokenHandler');
const authService = require('../services/authService');
const authController = require('../controllers/authController')(authService(firebaseGateway(), ValidGenuxTokenHandler()));

module.exports = function authRouter() {
  return express.Router().use(
    '/',
    express.Router()
      .post('/signUp', bodyValidator.authValidations, bodyValidator.validate, authController.signUp, errorHandler.handle)
      .post('/signIn', bodyValidator.authValidations, bodyValidator.validate, authController.signIn, errorHandler.handle)
      .post('/refreshToken', bodyValidator.refreshTokenValidations, bodyValidator.validate, authController.refreshToken, errorHandler.handle)
      .post('/deleteUser', bodyValidator.deleteUserValidations, bodyValidator.validate, authController.deleteUser, errorHandler.handle)
      .post('/generateGenuxToken', bodyValidator.generateGenuxTokenValidations, bodyValidator.validate, authController.generateGenuxToken, errorHandler.handle)
      .post('/useGenuxToken', bodyValidator.useGenuxTokenValidations, bodyValidator.validate, authController.useGenuxToken, errorHandler.handle)
  );
};

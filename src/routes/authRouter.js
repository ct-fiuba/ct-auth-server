const express = require('express');

const bodyValidator = require('../middlewares/bodyValidatorMiddleware')();
const errorHandler = require('../middlewares/errorHandlerMiddleware')();

const firebaseGateway = require('../gateways/firebaseGateway');
const authService = require('../services/authService');
const authController = require('../controllers/authController')(authService(firebaseGateway()));

module.exports = function authRouter() {
  return express.Router().use(
    '/',
    express.Router()
      .post('/signUp', bodyValidator.authValidations, bodyValidator.validate, authController.signUp, errorHandler.handle)
      .post('/signIn', bodyValidator.authValidations, bodyValidator.validate, authController.signIn, errorHandler.handle)
      .post('/refreshToken', bodyValidator.refreshTokenValidations, bodyValidator.validate, authController.refreshToken, errorHandler.handle)
      .post('/deleteUser', bodyValidator.deleteUserValidations, bodyValidator.validate, authController.deleteUser, errorHandler.handle)
  );
};

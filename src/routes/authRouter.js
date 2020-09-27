const express = require('express');

const bodyValidator = require('../middlewares/bodyValidatorMiddleware')();
const errorHandler = require('../middlewares/errorHandlerMiddleware')();

const FirebaseAuth = require('../gateways/firebase-auth');
const authService = require('../services/authService');
const firebaseGateway = require('../gateways/firebaseGateway')(FirebaseAuth());
const authController = require('../controllers/authController')(authService(firebaseGateway));

module.exports = function authRouter() {
  return express.Router().use(
    '/',
    express.Router()
      .post('/signUp', bodyValidator.authValidations, bodyValidator.validate, authController.signUp)
      .post('/signIn', bodyValidator.authValidations, bodyValidator.validate, authController.signIn)
      .post('/validateAccessToken', bodyValidator.validateTokenValidations, bodyValidator.validate, authController.validateAccessToken)
      .post('/refreshToken', bodyValidator.refreshTokenValidations, bodyValidator.validate, authController.refreshToken)
      .post('/deleteUser', bodyValidator.deleteUserValidations, bodyValidator.validate, authController.deleteUser)
      .use(errorHandler.handle)
  );
};

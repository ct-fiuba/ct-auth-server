const express = require('express');

const bodyValidator = require('../middlewares/bodyValidatorMiddleware')();
const errorHandler = require('../middlewares/errorHandlerMiddleware')();

const FirebaseAuth = require('../gateways/firebase-auth');
const authService = require('../services/authService');
const ValidGenuxTokenHandler = require('../models/handlers/ValidGenuxTokenHandler');
const firebaseGateway = require('../gateways/firebaseGateway')(FirebaseAuth());
const authController = require('../controllers/authController')(authService(firebaseGateway, ValidGenuxTokenHandler()));

module.exports = function authRouter() {
  return express.Router().use(
    '/',
    express.Router()
      .post('/signUp', bodyValidator.authValidations, bodyValidator.validate, authController.signUp)
      .post('/signIn', bodyValidator.authValidations, bodyValidator.validate, authController.signIn)
      .post('/validateAccessToken', bodyValidator.validateTokenValidations, bodyValidator.validate, authController.validateAccessToken)
      .post('/refreshToken', bodyValidator.refreshTokenValidations, bodyValidator.validate, authController.refreshToken)
      .post('/deleteUser', bodyValidator.deleteUserValidations, bodyValidator.validate, authController.deleteUser)
      .post('/generateGenuxToken', bodyValidator.validateTokenValidations, bodyValidator.validate, authController.generateGenuxToken)
      .post('/useGenuxToken', bodyValidator.useGenuxTokenValidations, bodyValidator.validate, authController.useGenuxToken)
      .post('/sendPasswordResetEmail', bodyValidator.sendPasswordResetEmailValidations, bodyValidator.validate, authController.sendPasswordResetEmail)
      .post('/confirmPasswordReset', bodyValidator.confirmPasswordResetValidations, bodyValidator.validate, authController.confirmPasswordReset)
      .post('/changePassword', bodyValidator.changePasswordValidations, bodyValidator.validate, authController.changePassword)
      .post('/sendEmailVerification', bodyValidator.sendEmailVerificationValidations, bodyValidator.validate, authController.sendEmailVerification)
      .post('/getUserData', bodyValidator.getUserDataValidations, bodyValidator.validate, authController.getUserData)
      .use(errorHandler.handle)
  );
};

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
      .post('/users/signUp', bodyValidator.usersSignUpValidations, bodyValidator.validate, authController.usersSignUp)
      .post('/users/logIn', bodyValidator.logInValidations, bodyValidator.validate, authController.usersLogIn)
      .post('/owners/signUp', bodyValidator.ownersSignUpValidations, bodyValidator.validate, authController.ownersSignUp)
      .post('/owners/logIn', bodyValidator.logInValidations, bodyValidator.validate, authController.ownersLogIn)
      .post('/admins/logIn', bodyValidator.logInValidations, bodyValidator.validate, authController.adminsLogIn)
      .post('/users/validateAccessToken', bodyValidator.validateTokenValidations, bodyValidator.validate, authController.usersValidateAccessToken)
      .post('/owners/validateAccessToken', bodyValidator.validateTokenValidations, bodyValidator.validate, authController.ownersValidateAccessToken)
      .post('/admins/validateAccessToken', bodyValidator.validateTokenValidations, bodyValidator.validate, authController.adminsValidateAccessToken)
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

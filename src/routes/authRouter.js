const express = require('express');

const firebaseGateway = require('../gateways/firebaseGateway');
const authService = require('../services/authService');
const authController = require('../controllers/authController')(authService(firebaseGateway()));

module.exports = function authRouter() {
  return express.Router().use(
    '/',
    express.Router()
      .post('/signUp', authController.signUp)
      .post('/signIn', authController.signIn)
  );
};

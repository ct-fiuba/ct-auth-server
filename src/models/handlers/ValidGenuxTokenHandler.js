const ValidGenuxToken = require('../schemas/ValidGenuxToken');
const { InvalidGenuxToken } = require('../../errors/invalidGenuxToken');
const mongoose = require('mongoose');

module.exports = function ValidGenuxTokenHandler() {
  const createGenuxToken = async () => {
    let genuxToken = {
      token: new mongoose.Types.ObjectId()
    };

    let newValidGenuxToken = new ValidGenuxToken(genuxToken);
    return newValidGenuxToken.save().then(savedDocument => ({
      genuxToken: savedDocument.token,
      expiresIn: process.env.GENUX_TOKEN_SECONDS_EXPIRATION
    }));
  };

  const useGenuxToken = async token => {
    return ValidGenuxToken.deleteOne({ token }).then(result => {
      if (result.n === 0) {
        throw new InvalidGenuxToken();
      } else {
        return true;
      }
    });
  };

  return {
    createGenuxToken,
    useGenuxToken
  };
};

const { RequestError } = require('./requestError');

class InvalidGenuxToken extends RequestError {
    constructor() {
      super('Invalid genux token', 403);
    }
  }
  
  module.exports = { InvalidGenuxToken }
const { RequestError } = require('../errors/requestError');

module.exports = function errorHandlerMiddleware() {
  const handle = (err, req, res, next) => {
    if (!(err instanceof RequestError)) {
      console.error(err);
      err = new RequestError('Something went wrong.', 500);
    }

    res.status(err.status).json({ reason: err.message });
  }

  return {
    handle
  };
}; 

module.exports = function errorHandlerMiddleware() {

  const handle = (err, req, res, next) => {
    res.status(err.status).json({ reason: err.message });
  }

  return {
    handle
  };
}; 
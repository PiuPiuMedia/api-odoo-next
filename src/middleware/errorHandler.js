const logger = require('../services').logger;

const errorHandler = (err, req, res, next) => {
  logger.error(err.message);
  res.status(err.status || 500).json({ error: err.message });
};

module.exports = errorHandler;

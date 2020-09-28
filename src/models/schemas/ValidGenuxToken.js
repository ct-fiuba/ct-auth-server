const mongoose = require("mongoose");

let validGenuxTokenSchema = mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: { unique: true }
  },
  createdAt: { type: Date, expires: process.env.GENUX_TOKEN_SECONDS_EXPIRATION, default: Date.now } //expires after 1h
});

module.exports = mongoose.model('ValidGenuxToken', validGenuxTokenSchema);

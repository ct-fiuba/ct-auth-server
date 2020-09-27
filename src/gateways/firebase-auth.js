const admin = require('firebase-admin');
require('dotenv').config();

module.exports = function auth() {
  if (process.env.TESTING) return {};

  const creds = JSON.parse(process.env.GOOGLE_SERVICE_CREDS);

  admin.initializeApp({
    credential: admin.credential.cert(creds)
  });

  return admin.auth();
};

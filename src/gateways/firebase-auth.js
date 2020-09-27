const admin = require('firebase-admin');
require('dotenv').config();

//secret ask tomi
const serviceAccount = require(`../../${process.env.GOOGLE_SERVICE_FILE}`);

module.exports = function auth() {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  return admin.auth();
};

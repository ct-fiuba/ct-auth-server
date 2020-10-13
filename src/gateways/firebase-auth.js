const admin = require('firebase-admin');

module.exports = function auth() {
  if (process.env.TESTING === 'true') {
    return {};
  }

  const creds = JSON.parse(process.env.GOOGLE_SERVICE_CREDS);

  admin.initializeApp({
    credential: admin.credential.cert(creds)
  });

  return admin.auth();
};

require('dotenv').config();

const fs = require('fs');

fs.writeFile(`./${process.env.GOOGLE_SERVICE_FILE}`, process.env.GOOGLE_SERVICE_CREDS, (err) => {});

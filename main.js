require('dotenv').config();
const app = require('./src/app');


const main = () => {
  const app_port = process.env.PORT;

  app().listen(app_port, () => {
    console.log(`CT-Auth server up in port ${app_port}!`);
  });
};


process.on('SIGINT', function() {
  process.exit();
});

if (require.main === module) {
  main();
}

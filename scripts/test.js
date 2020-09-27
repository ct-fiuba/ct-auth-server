const { spawn } = require('child_process');

const argv = require('minimist')(process.argv.slice(2));

const env = argv._[0];

const env_path = env ? `./.env.${env}` : '';

spawn(
  `node setup.js && ./node_modules/.bin/env-cmd -f ${env_path} jest int`,
  {
    stdio: 'inherit',
    shell: true
  }
);

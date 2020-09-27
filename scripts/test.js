const { spawn } = require('child_process');

const argv = require('minimist')(process.argv.slice(2));

const env = argv._[0];

const env_command = env ? `./node_modules/.bin/env-cmd -f  ./.env.${env}` : '';

spawn(
  `node setup.js && ${env_command} jest int`,
  {
    stdio: 'inherit',
    shell: true
  }
);

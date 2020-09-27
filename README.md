# ct-auth-server

Servidor de autenticación. Provee servicios de creación de cuentas, login, generación de tokens de un único uso, confirmación de cuenta y recuperación de contraseña.

## Usage
### Setup

Asegurarse de usar la version correcta de NodeJS:

    nvm use 

Si no se encuentra disponible la version, instalarla (`nvm install <version>`).

Tambien, asegurarse de contar con el archivo de variables de entorno correspondiente `.env`.

### Test

Pueden correrse tanto tests unitarios como de integracion:

    npm run test:unit
    npm run test:integration

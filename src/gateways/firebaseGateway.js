const got = require('got');
const { RequestError } = require('../errors/requestError');
const { replaceOne } = require('../models/schemas/ValidGenuxToken');

module.exports = function firebaseGateway(firebaseAuth) {
  const firebaseAPI = got.extend({
    prefixUrl: 'https://identitytoolkit.googleapis.com/v1'
  });

  const firebaseDatabaseAPI = got.extend({
    prefixUrl: 'https://ct-fiuba.firebaseio.com/rest'
  });

  const requestAuthFirebase = (action, data) => {
    return firebaseAPI.post(`accounts:${action}?key=${process.env.FIREBASE_API_KEY}`, { json: data })
      .then(firebaseResponse => {
        return JSON.parse(firebaseResponse.body);
      })
      .catch(error => {
        const status = error.response.statusCode;
        const message = JSON.parse(error.response.body).error.message;
        throw new RequestError(message, status);
      });
  }

  const pushUserDNI = (userId, dni) => {
    return firebaseDatabaseAPI.put(`users/${userId}/dni.json`, {json: {dni}})
      .then(firebaseDatabaseResponse => {
        return JSON.parse(firebaseDatabaseResponse.body);
      })
      .catch(error => {
        const status = error.response.statusCode;
        const message = JSON.parse(error.response.body).error.message;
        throw new RequestError(message, status);
      });
  }

  const pushUserRole = (userId, role) => {
    return firebaseDatabaseAPI.put(`users/${userId}/role.json`, {json: {role}})
      .then(firebaseDatabaseResponse => {
        return JSON.parse(firebaseDatabaseResponse.body);
      })
      .catch(error => {
        const status = error.response.statusCode;
        const message = JSON.parse(error.response.body).error.message;
        throw new RequestError(message, status);
      });
  }

  const getUserDNI = (userId) => {
    return firebaseDatabaseAPI.get(`users/${userId}/dni.json?print=pretty`)
      .then(firebaseDatabaseResponse => {
        return JSON.parse(firebaseDatabaseResponse.body);
      })
      .catch(error => {
        const status = error.response.statusCode;
        const message = JSON.parse(error.response.body).error.message;
        throw new RequestError(message, status);
      });
  }

  const getUserRole = (userId) => {
    return firebaseDatabaseAPI.get(`users/${userId}/role.json?print=pretty`)
      .then(firebaseDatabaseResponse => {
        return JSON.parse(firebaseDatabaseResponse.body);
      })
      .catch(error => {
        const status = error.response.statusCode;
        const message = JSON.parse(error.response.body).error.message;
        throw new RequestError(message, status);
      });
  }

  const signUp = async userInfo => {
    const { idToken, email, refreshToken, expiresIn, localId } = await requestAuthFirebase('signUp', { ...userInfo, returnSecureToken: true });
    return { accessToken: idToken, email, refreshToken, expiresIn, userId: localId };
  };

  const signIn = async credentials => {
    const { idToken, email, refreshToken, expiresIn, localId } = await requestAuthFirebase('signInWithPassword', { ...credentials, returnSecureToken: true });
    return { accessToken: idToken, email, refreshToken, expiresIn, userId: localId };
  };

  const usersSignUp = async userInfo => {
    const response = await signUp(userInfo);
    const dniResponse = await pushUserDNI(response.userId, userInfo.DNI);
    const roleResponse = await pushUserRole(response.userId, 'user');
    return {...response, ...dniResponse, ...roleResponse};
  };

  const ownersSignUp = async ownerInfo => {
    const response = await signUp(ownerInfo);
    const roleResponse = await pushUserRole(response.userId, 'owner');
    return {...response, ...roleResponse};
  };

  const usersSignIn = async credentials => {
    const response = await signIn(credentials);
    let dniResponse = await getUserDNI(response.userId);
    const roleResponse = await getUserRole(response.userId);
    if (!roleResponse.hasOwnProperty('role') || roleResponse['role'] !== 'user') {
      throw new RequestError('El usuario logueado no tiene el rol "user"', 404);
    }
    if (!dniResponse.hasOwnProperty('dni')) {
      dniResponse = {dni: 'Sin documento registrado'};
    }
    return {...response, ...dniResponse, ...roleResponse};
  };

  const ownersSignIn = async credentials => {
    const response = await signIn(credentials);
    const roleResponse = await getUserRole(response.userId);
    if (!roleResponse.hasOwnProperty('role') || roleResponse['role'] !== 'owner') {
      throw new RequestError('El usuario logueado no tiene el rol "owner"', 404);
    }
    return {...response, ...roleResponse};
  };

  const adminsSignIn = async credentials => {
    const response = await signIn(credentials);
    const roleResponse = await getUserRole(response.userId);
    if (!roleResponse.hasOwnProperty('role') || roleResponse['role'] !== 'admin') {
      throw new RequestError('El usuario logueado no tiene el rol "admin"', 404);
    }
    return {...response, ...roleResponse};
  };

  const usersValidateIdToken = async idToken => {
    try {
      const decodedToken = await firebaseAuth.verifyIdToken(idToken, true);
      if (!decodedToken.hasOwnProperty('uid')) {
        throw new RequestError("El access token recibido no es válido", 401);
      }
      const userId = decodedToken.uid;
      const roleResponse = await getUserRole(userId);
      if (!roleResponse.hasOwnProperty('role') || roleResponse['role'] !== 'user') {
        throw new RequestError('El usuario logueado no tiene el rol "user"', 404);
      }
      return userId;
    } catch (err) {
      throw new RequestError(err.message, err.status || 401);
    }
  };

  const ownersValidateIdToken = async idToken => {
    try {
      const decodedToken = await firebaseAuth.verifyIdToken(idToken, true);
      if (!decodedToken.hasOwnProperty('uid')) {
        throw new RequestError("El access token recibido no es válido", 401);
      }
      const userId = decodedToken.uid;
      const roleResponse = await getUserRole(userId);
      if (!roleResponse.hasOwnProperty('role') || roleResponse['role'] !== 'owner') {
        throw new RequestError('El usuario logueado no tiene el rol "owner"', 404);
      }
      return userId;
    } catch (err) {
      throw new RequestError(err.message, err.status || 401);
    }
  };

  const adminsValidateIdToken = async idToken => {
    try {
      const decodedToken = await firebaseAuth.verifyIdToken(idToken, true);
      if (!decodedToken.hasOwnProperty('uid')) {
        throw new RequestError("El access token recibido no es válido", 401);
      }
      const userId = decodedToken.uid;
      const roleResponse = await getUserRole(userId);
      if (!roleResponse.hasOwnProperty('role') || roleResponse['role'] !== 'admin') {
        throw new RequestError('El usuario logueado no tiene el rol "admin"', 404);
      }
      return userId;
    } catch (err) {
      throw new RequestError(err.message, err.status || 401);
    }
  };

  const refreshToken  = async ({ refreshToken }) => {
    return got.post(`https://securetoken.googleapis.com/v1/token?key=${process.env.FIREBASE_API_KEY}`, {
        json: {
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }
    })
      .then(firebaseResponse => {
        const { id_token, expires_in, user_id } = JSON.parse(firebaseResponse.body);
        return { accessToken: id_token, expiresIn: expires_in, userId: user_id };
      })
      .catch(error => {
        const status = error.response.statusCode;
        const message = JSON.parse(error.response.body).error.message;
        throw new RequestError(message, status);
      });
  };

  const deleteUser = async ({ userId }) => {
    return firebaseAuth.deleteUser(userId)
      .then(() => userId)
      .catch(function(error) {
        throw new RequestError(error.message, 400);
      });
  };

  const sendPasswordResetEmail = async email => {
    const res = await requestAuthFirebase('sendOobCode', { requestType: 'PASSWORD_RESET', email: email });
    return { email: res.email };
  };

  const confirmPasswordReset = async passwordResetInfo => {
    const { email, requestType } = await requestAuthFirebase('resetPassword', passwordResetInfo);
    return { email, requestType };
  };

  const changePassword = async passwordChangeInfo => {
    const { idToken, email, refreshToken, expiresIn, localId, passwordHash, providerUserInfo } = await requestAuthFirebase('update', { ...passwordChangeInfo, returnSecureToken: true });
    return { accessToken: idToken, email, refreshToken, expiresIn, userId: localId };
  };

  const sendEmailVerification = async idToken => {
    const { email } = await requestAuthFirebase('sendOobCode', { idToken, requestType: "VERIFY_EMAIL" });
    return { email };
  };

  const getUserData = async idToken => {
    const { users } = await requestAuthFirebase('lookup', { idToken });
    dni_response = await getUserDNI(users[0]['localId']);
    role_response = await getUserRole(users[0]['localId']);
    return {
      "userId": users[0]['localId'],
      "email": users[0]['email'],
      "emailVerified": users[0]['emailVerified'],
      "displayName": users[0]['displayName'],
      "photoUrl": users[0]['photoUrl'],
      "lastLoginAt": users[0]['lastLoginAt'],
      "createdAt": users[0]['createdAt'],
      "DNI": dni_response.hasOwnProperty('dni') ? dni_response['dni'] : "Sin documento registrado",
      "role": role_response.hasOwnProperty('role') ? role_response['role'] : "Sin rol asignado"
    };
  };

  return {
    usersSignUp,
    usersSignIn,
    ownersSignUp,
    ownersSignIn,
    adminsSignIn,
    usersValidateIdToken,
    ownersValidateIdToken,
    adminsValidateIdToken,
    refreshToken,
    deleteUser,
    sendPasswordResetEmail,
    confirmPasswordReset,
    changePassword,
    sendEmailVerification,
    getUserData
  };
};

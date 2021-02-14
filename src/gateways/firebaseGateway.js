const got = require('got');
const { RequestError } = require('../errors/requestError');

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

  const putUserDNI = (userId, dni) => {
    const payload = {};
    payload[userId] = {DNI: dni};
    return firebaseDatabaseAPI.put("users.json", { json: payload })
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
    return firebaseDatabaseAPI.get(`users.json?orderBy="$key"&equalTo="${userId}"`)
      .then(firebaseDatabaseResponse => {
        return JSON.parse(firebaseDatabaseResponse.body);
      })
      .catch(error => {
        const status = error.response.statusCode;
        const message = JSON.parse(error.response.body).error.message;
        throw new RequestError(message, status);
      });
  }

  const isAdminUser = (userId) => {
    return firebaseDatabaseAPI.get(`admin.json?orderBy="$key"&equalTo="${userId}"`)
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
    await putUserDNI(localId, userInfo.DNI);
    return { accessToken: idToken, email, refreshToken, expiresIn, userId: localId };
  };

  const signIn = async credentials => {
    const { idToken, email, refreshToken, expiresIn, localId } = await requestAuthFirebase('signInWithPassword', { ...credentials, returnSecureToken: true });
    return { accessToken: idToken, email, refreshToken, expiresIn, userId: localId };
  };

  const validateIdToken = async idToken => {
    return firebaseAuth.verifyIdToken(idToken, true)
      .then(decodedToken => decodedToken.uid)
      .catch(error => {
        throw new RequestError(error.message, 401);
      });
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
    admin_response = await isAdminUser(users[0]['localId']);
    return {
      "userId": users[0]['localId'],
      "email": users[0]['email'],
      "emailVerified": users[0]['emailVerified'],
      "displayName": users[0]['displayName'],
      "photoUrl": users[0]['photoUrl'],
      "lastLoginAt": users[0]['lastLoginAt'],
      "createdAt": users[0]['createdAt'],
      "DNI": dni_response.hasOwnProperty(users[0]['localId']) ? dni_response[users[0]['localId']]['DNI'] : "Sin documento registrado",
      "admin": admin_response.hasOwnProperty(users[0]['localId']) ? admin_response[users[0]['localId']] : false
    };
  };

  return {
    signUp,
    signIn,
    validateIdToken,
    refreshToken,
    deleteUser,
    sendPasswordResetEmail,
    confirmPasswordReset,
    changePassword,
    sendEmailVerification,
    getUserData
  };
};

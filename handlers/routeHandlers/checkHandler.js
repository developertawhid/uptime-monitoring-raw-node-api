/*
* Title: Check Handler
* Description: Handler to handle user defined checks
* Author: SM Tawhid ( Developer Tawhid )
* Date: 20/08/2021
*/

// deppendencies
const data = require('../../lib/data');
const {parseJSON, createRandomString} = require('../../helpers/utilities');
const {maxChecks} = require('../../helpers/environments');
const tokenHandler = require('./tokenHandler');

// module scaffolding
const handle = {};

handle.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handle._check[requestProperties.method](requestProperties, callback);
    }else {
        callback(405);
    }
};

handle._check = {};

handle._check.post = (requestProperties, callback) => {
    const { body, headersObject } = requestProperties;
    // validate inputs
    const protocal = typeof(body.protocal) === 'string' && ['http', 'https'].indexOf(body.protocal) > -1 ? body.protocal : false;

    const url = typeof(body.url) === 'string' && body.url.trim().length > 0 ? body.url.trim() : false;

    const method = typeof(body.method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(body.method) > -1 ? body.method : false;

    const successCodes = typeof(body.successCodes) === 'object' && body.successCodes instanceof Array ? body.successCodes : false;

    const timeOutSeconds = typeof(body.timeOutSeconds) === 'number' && body.timeOutSeconds % 1 === 0 && body.timeOutSeconds > 0 && body.timeOutSeconds < 6 ? body.timeOutSeconds : false;

    if (protocal && url && method && successCodes && timeOutSeconds) {
        const token = typeof(headersObject.token) === 'string' ? headersObject.token : false;

        // lookup the user phone by reading the token
        data.read('tokens', token, (err1, tokenData) => {
            if (!err1 && tokenData) {
                const userPhone = parseJSON(tokenData).phone;

                // lookup the user data
                data.read('users', userPhone, (err2, userData) => {
                    if (!err2 && userData) {
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                const userObject = {...parseJSON(userData)};
                                const userChacks = typeof(userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                                if (userChacks.length <= maxChecks) {
                                    const checkId = createRandomString(20);
                                    const checkObject = {
                                        id: checkId,
                                        userPhone,
                                        protocal,
                                        url,
                                        method,
                                        successCodes,
                                        timeOutSeconds,
                                    }

                                    // save the object
                                    data.create('checks', checkId, checkObject, (err3) => {
                                        if (!err3) {
                                            // add check id to the user's object
                                            userObject.checks = userChacks;
                                            userObject.checks.push(checkId);

                                            // save the new user data
                                            data.update('users', userPhone, userObject, (err4) => {
                                                if (!err4) {
                                                    // return the data about the new check
                                                    callback(200, checkObject);
                                                }else {
                                                    callback(500, {
                                                        error: 'There was a problem in the server side!',
                                                    });
                                                }
                                            });
                                        }else {
                                            callback(500, {
                                                error: 'There was a problem in the server side!',
                                            });
                                        }
                                    });
                                }else {
                                    callback(401, {
                                        error: 'Userhas already reacked max check limit!',
                                    });
                                }
                            }else {
                                callback(403, {
                                    error: 'Authentication problem!',
                                });
                            }
                        });
                    }else {
                        callback(403, {
                            error: 'User not found!',
                        });
                    }
                });
            }else {
                callback(403, {
                    error: 'Authentication problem!',
                });
            }
        });
    }else {
        callback(400, {
            error: 'You have a problem in your request!',
        })
    }
}

handle._check.get = (requestProperties, callback) => {
   // check the token id if valide
   const {queryStringObject, headersObject} = requestProperties;
   const id = queryStringObject.id && typeof( queryStringObject.id === 'string') && queryStringObject.id.trim().length === 20
   ? queryStringObject.id.trim() : null;

   if (id) {
       // lookup the check
       data.read('checks', id, (err, checkDataDB) => {
           const checkData = { ...parseJSON(checkDataDB) };
           if (!err && checkDataDB) {
                // user token
                const token = typeof(headersObject.token) === 'string' ? headersObject.token : false;

                // verify user token
                tokenHandler._token.verify(token, checkData.userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        callback(200, checkData)
                    }else {
                        callback(403, {
                            error: 'Authentication failure!',
                        })
                    }
                });
           }else {
               callback(500, {
                   error: 'You have a problem in your request!',
               })
           }
       })
   }else {
       callback(400, {
           error: 'You have a problem in your request!,',
       })
   } 
}

handle._check.put = (requestProperties, callback) => {
    const { body, headersObject } = requestProperties;

    // validate inputs
    const id = typeof(body.id) === 'string' && body.id.length === 20 ? body.id : false;

    const protocal = typeof(body.protocal) === 'string' && ['http', 'https'].indexOf(body.protocal) > -1 ? body.protocal : false;

    const url = typeof(body.url) === 'string' && body.url.trim().length > 0 ? body.url.trim() : false;

    const method = typeof(body.method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(body.method) > -1 ? body.method : false;

    const successCodes = typeof(body.successCodes) === 'object' && body.successCodes instanceof Array ? body.successCodes : false;

    const timeOutSeconds = typeof(body.timeOutSeconds) === 'number' && body.timeOutSeconds % 1 === 0 && body.timeOutSeconds > 0 && body.timeOutSeconds < 6 ? body.timeOutSeconds : false;

    if (id) {
        if (protocal || url || method || successCodes || timeOutSeconds) {
            data.read('checks', id, (err1, checkData) => {
                if (!err1 && checkData) {
                    const checkObject = {...parseJSON(checkData)};
                    const token = typeof(headersObject.token) === 'string' ? headersObject.token : false;

                    //  User token verify
                    tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            if (protocal) checkObject.protocal = protocal;
                            if (url) checkObject.url = url;
                            if (method) checkObject.method = method;
                            if (successCodes) checkObject.successCodes = successCodes;
                            if (timeOutSeconds) checkObject.timeOutSeconds = timeOutSeconds;

                            // store the checkObject
                            data.update('checks', id, checkObject, (err2) => {
                                if(!err2) {
                                    callback(200, checkObject);
                                }else {
                                    callback(500, {
                                        error: 'There was a server side error!',
                                    })
                                }
                            })
                        }else {
                            callback(403, {
                                error: 'Authentication error!',
                            })
                        }
                    });
                }else {
                    callback(500, {
                        error: 'your request check id invalid!',
                    })
                }
            });
        }else {
            callback(400, {
                error: 'You must provide at least one field to update!'
            })
        }
    }else {
        callback(400, {
            error: 'You have a problem in your request!',
        })
    }
}

handle._check.delete = (requestProperties, callback) => {
   // check the token id if valide
   const {queryStringObject, headersObject} = requestProperties;
   const id = queryStringObject.id && typeof( queryStringObject.id === 'string') && queryStringObject.id.trim().length === 20
   ? queryStringObject.id.trim() : null;

   if (id) {
       // lookup the check
       data.read('checks', id, (err1, checkDataDB) => {
           const checkData = { ...parseJSON(checkDataDB) };
           if (!err1 && checkDataDB) {
                // user token
                const token = typeof(headersObject.token) === 'string' ? headersObject.token : false;

                // verify user token
                tokenHandler._token.verify(token, checkData.userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        // delete the check data
                        data.delete('checks', id, (err2) => {
                            if(!err2) {
                                data.read('users', checkData.userPhone, (err3, userData) => {
                                    if(!err3 && userData) {
                                        const userObject = {...parseJSON(userData)};
                                        const userChecks = typeof(userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                                        //remove the deleted check id from user's list of checks
                                        const checkPosition = userChecks.indexOf(id);
                                        if(checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1);
                                            // resave the use data
                                            userObject.checks = userChecks;
                                            data.update('users', userObject.phone, userObject, (err4) => {
                                                if(!err4) {
                                                    callback(200, {
                                                        erroe: 'There was successfully deleted!',
                                                    })
                                                }else {
                                                    callback(500, {
                                                        error: 'There was a server side problem!',
                                                    })
                                                }
                                            })
                                        }else {
                                            callback(403, {
                                                error: 'The check id that you are trying to remove is not found in user!',
                                            })
                                        }

                                    }else {
                                        callback(500, {
                                            error: 'There was a server side problem!',
                                        })
                                    }
                                })
                            }else {
                                callback(500, {
                                    error: 'There was a server side problem!',
                                })
                            }
                        })
                    }else {
                        callback(403, {
                            error: 'Authentication failure!',
                        })
                    }
                });
           }else {
               callback(500, {
                   error: 'You have a problem in your request!',
               })
           }
       })
   }else {
       callback(400, {
           error: 'You have a problem in your request!,',
       })
   } 
}

module.exports = handle;

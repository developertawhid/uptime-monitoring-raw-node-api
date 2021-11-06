/*
* Title: User Handler
* Description: Handler to handle user related routes
* Author: SM Tawhid ( Developer Tawhid )
* Date: 18/08/2021
*/

// deppendencies
const data = require('../../lib/data');
const {hash} = require('../../helpers/utilities');
const {parseJSON} = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');

// module scaffolding
const handle = {};

handle.userHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if(acceptedMethods.indexOf(requestProperties.method) > -1) {
        handle._users[requestProperties.method](requestProperties, callback);
    }else {
        callback(405);
    }
};

handle._users = {};

handle._users.post = (requestProperties, callback) => {
    const { body } = requestProperties;

    const firstName = body.firstName && typeof(body.firstName) === 'string' && body.firstName.trim().length > 0
    ? body.firstName.trim() : null;

    const lastName = body.lastName && typeof(body.lastName) === 'string' && body.lastName.trim().length > 0
    ? body.lastName.trim() : null;

    const phone = body.phone && typeof(body.phone) === 'string' && body.phone.trim().length > 9
    ? body.phone.trim() : null;

    const password = body.password && typeof(body.password) === 'string' && body.password.trim().length > 5
    ? body.password.trim() : null;

    const tosAgreement = body.tosAgreement && typeof(body.tosAgreement) === 'string' && body.tosAgreement.trim().length > 0
    ? body.tosAgreement.trim() : null;

    if(firstName && lastName && phone && password && tosAgreement ) {
        // make sute that tjhe user doesn't alteady exists
        data.read('users', phone, (err1) => {
            if(err1) {
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };

                // store the uder to db
                data.create('users', phone, userObject, (err2) => {
                    if(!err2) {
                        callback(200, {
                            message: 'User was created successfully!',
                        });
                    }else {
                        callback(500, {error: 'cold no create user'});
                    }
                })
            }else {
                callback(500, {
                    error: 'Your phone number already been used!'
                })
            }
        })

    }else {
        callback(400, {
            error: 'You have a problem in yout in post request 400',
        })
    }
}

handle._users.get = (requestProperties, callback) => {
    // check the phone number if valide
    const {queryStringObject, headersObject} = requestProperties;
    const phone = queryStringObject.phone && typeof( queryStringObject.phone === 'string') && queryStringObject.phone.trim().length > 9
    ? queryStringObject.phone.trim() : null;

    if(phone) {
        // verify token
        const token = typeof(headersObject.token) == 'string' && headersObject.token.length === 20 ? headersObject.token : false;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            if(tokenId) {
                // lookup the user
                data.read('users', phone, (err, u) => {
                    const user = { ...parseJSON(u) };
                    delete user.password;
                    if(!err && user){
                        callback(200, user)
                    }else {
                        callback(404, {
                            error: 'Requested user was not found!',
                        })
                    }
                })
            }else {
                callback(403, {
                    error: 'Authentication failure!',
                })
            }
        })
    }else {
        callback(404, {
            error: 'Requested user was not found!,',
        })
    }
}

handle._users.put = (requestProperties, callback) => {
    const { body, headersObject } = requestProperties;
    
    const firstName = body.firstName && typeof(body.firstName) === 'string' && body.firstName.trim().length > 0
    ? body.firstName.trim() : null;

    const lastName = body.lastName && typeof(body.lastName) === 'string' && body.lastName.trim().length > 0
    ? body.lastName.trim() : null;

    const phone = body.phone && typeof(body.phone) === 'string' && body.phone.trim().length > 9
    ? body.phone.trim() : null;

    const password = body.password && typeof(body.password) === 'string' && body.password.trim().length > 5
    ? body.password.trim() : null;

    if(phone) {
        if(firstName || lastName || password ) {
            // verify token
            const token = typeof(headersObject.token) == 'string' && headersObject.token.length === 20 ? headersObject.token : false;

            tokenHandler._token.verify(token, phone, (tokenId) => {
                if(tokenId) {
                    // loopkup the user
                    data.read('users', phone, (err1, uData) => {
                        const userData = { ...parseJSON(uData) };
        
                        if(!err1 && uData) {
        
                            // updete to data
                            if(firstName){
                                userData.firstName = firstName;
                            }
                            if(firstName){
                                userData.lastName = lastName;
                            }
                            if(firstName){
                                userData.password = hash(password);
                            }
        
                            // store to database
                            data.update('users', phone, userData, (err2) => {
                                if(!err2) {
                                    callback(200, {
                                        message: 'user was updated successfully!',
                                    })
                                }else {
                                    callback(500, {
                                        error: 'There was a problem in the servar site!',
                                    })
                                }
                            })
                        }else {
                            callback(400, {
                                error: 'You have a problem in your request!',
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
            callback(400, {
                error: 'You have a problem in your request!',
            })
        }
    }else {
        console.log(body.phone)
        callback(400, {
            error: 'Invalid phone number. Please try again!',
        })
    }
}

handle._users.delete = (requestProperties, callback) => {
    // check the phone number if valide
    const {queryStringObject, headersObject} = requestProperties;
    const phone = queryStringObject.phone && typeof( queryStringObject.phone === 'string') && queryStringObject.phone.trim().length > 9
    ? queryStringObject.phone.trim() : null;

    if(phone) {
        // verify token
        const token = typeof(headersObject.token) == 'string' && headersObject.token.length === 20 ? headersObject.token : false;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            if(tokenId) {
                // lookup the user
                data.read('users', phone, (err1, userdata) => {
                    if(!err1 && userdata) {
                        data.delete('users', phone, (err2) => {
                            if(!err2) {
                                callback(200, {
                                    erroe: 'There was successfully deleted!',
                                })
                            }else {
                                callback(500, {
                                    erroe: 'There was a server side error!',
                                })
                            }
                        })
                    }else {
                        callback(500, {
                            erroe: 'There was a server side error!',
                        })
                    }
                });
            }else {
                callback(403, {
                    error: 'Authentication failure!',
                })
            }
        });
    }else {
        callback(400, {
            erroe: 'There was a problame in your request!',
        })
    }
}

module.exports = handle;
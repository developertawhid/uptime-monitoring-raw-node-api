/*
* Title: Token Handler
* Description: Handler to handle Token related routes
* Author: SM Tawhid ( Developer Tawhid )
* Date: 19/08/2021
*/

// deppendencies
const data = require('../../lib/data');
const { hash, createRandomString, parseJSON } = require('../../helpers/utilities');

// module scaffolding
const handle = {};

handle.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if(acceptedMethods.indexOf(requestProperties.method) > -1) {
        handle._token[requestProperties.method](requestProperties, callback);
    }else {
        callback(405);
    }
};

handle._token = {};

handle._token.post = (requestProperties, callback) => {
    const {body} = requestProperties;
    
    const phone = body.phone && typeof(body.phone) === 'string' && body.phone.trim().length > 9
    ? body.phone.trim() : false;

    const password = body.password && typeof(body.password) === 'string' && body.password.trim().length > 5
    ? body.password.trim() : false;

    if(phone && password) {
        data.read('users', phone, (err1, userData) => {
            const hashedPassword = hash(password);
            if(hashedPassword === parseJSON(userData).password) {
                const tokenId = createRandomString(20);
                const expires = Date.now() + (60 * 60 * 1000);
                const tokenObject = {
                    phone,
                    id: tokenId,
                    expires,
                }

                // store the token
                data.create('tokens', tokenId, tokenObject, (err2) => {
                    if(!err2) {
                        callback(200, tokenObject)
                    }else {
                        callback(500, {
                            error: 'There was a problem in the server side!',
                        }) 
                    }
                })
            }else {
                callback(400, {
                    error: 'Passwoer is not valid!',
                }) 
            }
        })
    }else {
        callback(400, {
            error: 'You have a problem in yout request',
        })
    }

}

handle._token.get = (requestProperties, callback) => {
   // check the token id if valide
   const {queryStringObject} = requestProperties;
   const id = queryStringObject.id && typeof( queryStringObject.id === 'string') && queryStringObject.id.trim().length === 20
   ? queryStringObject.id.trim() : null;

   if(id) {
       data.read('tokens', id, (err, tokenId) => {
           const token = { ...parseJSON(tokenId) };
           if(!err && token){
               callback(200, token)
           }else {
               callback(404, {
                   error: 'Requested token id was not found!',
               })
           }
       })
   }else {
       callback(404, {
           error: 'Requested token id was not found!,',
       })
   } 
}

handle._token.put = (requestProperties, callback) => {
    const {body} = requestProperties;
    
    const id = body.id && typeof(body.id) === 'string' && body.id.trim().length === 20
    ? body.id.trim() : false;
        
    const expires = body.expires && typeof(body.expires) === 'boolean'
    ? true : false;

    console.log(body)
    if(id && expires) {
        data.read('tokens', id, (err1, tikenData) => {
            const tokenObject = {...parseJSON(tikenData)};
            if(tokenObject.expires > Date.now()) {
                tokenObject.expires = Date.now() + (60 * 60 * 1000);
                // store the updated token
                data.update('tokens', id, tokenObject, (err2) => {
                    if(!err2) {
                        callback(200, {
                            message: 'User was created successfully!',
                        })
                    }else {
                        callback(500, {
                            error: 'There was a server side error!',
                        }) 
                    }
                })
            }else {
                callback(400, {
                    error: 'Token id already expired!',
                }) 
            }
        })
    }else {
        callback(400, {
            error: 'There was a problem in your request!',
        })
    }
}

handle._token.delete = (requestProperties, callback) => {
  // check the phone number if valide
  const {queryStringObject} = requestProperties;
  const id = queryStringObject.id && typeof( queryStringObject.id === 'string') && queryStringObject.id.trim().length === 20
  ? queryStringObject.id.trim() : false;

  if(id) {
    // lookup the user
    data.read('tokens', id, (err1, userdata) => {
        if(!err1 && userdata) {
            data.delete('tokens', id, (err2) => {
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
                erroe: 'There was a server side error! 500',
            })
        }
    })
  }else {
      callback(400, {
          erroe: 'There was a problame in your request!',
      })
  }
}

handle._token.verify = (id, phone, callback) => {
    data.read('tokens', id, (err, tokenData) => {
        if(!err && tokenData) {
            if(parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()) {
                callback(true);
            }else {
                callback(false);
            }
        }else {
            callback(false);
        }
    })
}

module.exports = handle;
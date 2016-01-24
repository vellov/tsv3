/**
 * Created by vellovaherpuu on 24/01/16.
 */
var jwt                 = require('jsonwebtoken');
var config              = require('./modules/config');
var exports = module.exports = { };

exports.verifyToken = function(token, callback){
    jwt.verify(token.split(" ")[1], config.secretToken, callback);
};


var crypto 		= require('crypto');
var moment 		= require('moment');
var User        = require('../models/user');

exports.manualLogin = function(username, pass, callback)
{
    User.findOne({username: username}, function(e, o) {
        if (o == null){
            callback('user-not-found');
        }	else{
            validatePassword(pass, o.password, function(err, res) {
                if (res){
                    callback(null, o);
                }	else{
                    callback('invalid-password');
                }
            });
        }
    });
}

/* record insertion, update & deletion methods */

exports.addNewAccount = function(newData, callback)
{
    User.findOne({username: newData.username}, function(e, o) {
        if (o){
            callback('username-taken');
        } else{
            saltAndHash(newData.password, function(hash){
                newData.password = hash;
                newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
                User.create(newData, callback);
            });

        }
    });
}



/* private encryption & validation methods */

var generateSalt = function()
{
    var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
    var salt = '';
    for (var i = 0; i < 10; i++) {
        var p = Math.floor(Math.random() * set.length);
        salt += set[p];
    }
    return salt;
}

var md5 = function(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function(pass, callback)
{
    var salt = generateSalt();
    callback(salt + md5(pass + salt));
}

var validatePassword = function(plainPass, hashedPass, callback)
{
    var salt = hashedPass.substr(0, 10);
    var validHash = salt + md5(plainPass + salt);
    callback(null, hashedPass === validHash);
}

/* auxiliary methods */

var getObjectId = function(id)
{
    return new require('mongodb').ObjectID(id);
}

var findById = function(id, callback)
{
    accounts.findOne({_id: getObjectId(id)},
        function(e, res) {
            if (e) callback(e)
            else callback(null, res)
        });
};


var findByMultipleFields = function(a, callback)
{
// this takes an array of name/val pairs to search against {fieldName : 'value'} //
    accounts.find( { $or : a } ).toArray(
        function(e, results) {
            if (e) callback(e)
            else callback(null, results)
        });
}
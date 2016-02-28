var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var crypto 		= require('crypto');

var userSchema = new mongoose.Schema({
	username :  {type : String, default: ''},
    firstname:  {type : String, default: ''},
    lastname:   {type : String, default: ''},
    password:   {type : String, default:''},
    email:      {type : String },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

userSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) return next();

    saltAndHash(user.password, function(hash){
        user.password = hash;
        next();
    });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    validatePassword(candidatePassword, this.password, function(err, isMatch){
        if (err) return cb(err);
        cb(null, isMatch);
    })
};

var User = mongoose.model('User', userSchema);

passport.use(new LocalStrategy(function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'Incorrect username.' });
        user.comparePassword(password, function(err, isMatch) {
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect password.' });
            }
        });
    });
}));


function generateSalt() {
    var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
    var salt = '';
    for (var i = 0; i < 10; i++) {
        var p = Math.floor(Math.random() * set.length);
        salt += set[p];
    }
    return salt;
}

function md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

function saltAndHash(pass, callback) {
    var salt = generateSalt();
    callback(salt + md5(pass + salt));
}

function validatePassword(plainPass, hashedPass, callback) {
    var salt = hashedPass.substr(0, 10);
    var validHash = salt + md5(plainPass + salt);
    callback(null, hashedPass === validHash);
}


module.exports = User;

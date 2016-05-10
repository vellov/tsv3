var User                = require('../models/user');
var passport            = require('passport');
var jwt                 = require('jsonwebtoken');
var async               = require('async');
var nodemailer          = require('nodemailer');
var config              = require('../modules/config');
var crypto 		        = require('crypto');

var exports = module.exports = { };


exports.login = function(req, res, next){
    passport.authenticate('local', function(err, user, info) {
        if (err) return next(err);
        if (!user) {
            res.status(401).send(info);
        } else {
            var token = jwt.sign(user, config.secretToken, { expiresInMinutes: 60 });
            res.json({token:token, user:{id: user._id, username: user.username, firstname: user.firstname, lastname: user.lastname}});
        }
    })(req, res, next);
};

exports.registerUser = function(req, res){
    User.find({$or:[{username: req.body.username},{email: req.body.email}]}, function(err, user){
       if(err) {
           res.status(400).send(err);
       } else if (user) {
           res.status(409).send({message: "User with this username or e-mail already exists!"});
       } else {
           var user = new User({
               username: req.body.username,
               email: req.body.email,
               password: req.body.password,
               firstname: req.body.firstname,
               lastname: req.body.lastname
           });

           user.save(function(err, user) {
               if (err){
                   res.status(400).send(e);
               } else {
                   var token = jwt.sign(user, config.secretToken, { expiresInMinutes: 60 });
                   res.json({token:token, user:{id: user._id, username: user.username, firstname: user.firstname, lastname: user.lastname}});
               }
           });
       }
    });



};

exports.forgotPassword = function(req, res){
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    res.status(404).send({message: "No account with this email address exists."});
                }
                else {
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    user.save(function(err) {
                        done(err, token, user);
                    });
                }
            });
        },
        function(token, user, done) {
            var client = nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USER,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });

            var opt = {
                from: 'support@progtugi.ee',
                to: user.email,
                subject: 'Murelahendaja password recovery',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/#/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            client.sendMail(opt, function(err, info) {
                console.log('Password recovery e-mail sent to', user.email);
                done(err, info);
            });
        }
    ], function(err) {
        if (err){
            res.send(err);
        } else {
            res.send({message: "Password reset email sent. Please check your email."});
        }
    });
};

exports.resetPassword = function(req, res){
    async.waterfall([
        function(done) {
            User.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                    res.status(400).send({message:"Password reset token is invalid or has expired."});
                } else {
                    user.password = req.body.password;
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;

                    user.save(function(err) {
                        if(err){
                            res.status(400).send(err);
                        } else {
                            done(err, user);
                        }
                    });
                }
            });
        },
        function(user, done) {
            var client = nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USER,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });

            var mailOptions = {
                to: user.email,
                from: 'support@progtugi.ee',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            client.sendMail(mailOptions, function(err) {
                console.log('Password changed success email sent to', user.email);
                done(err);
            });
        }
    ], function(err, info) {
        if(err){
            res.status(400).send(err);
        } else {
            res.send("OK");
        }
    });
};

exports.tokenExpired = function(req, res){
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            res.status(400).send({"message":"Password reset token is invalid or has expired."})
        } else {
            res.send(user);
        }

    });
};
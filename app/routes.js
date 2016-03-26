var User                = require('./models/user');
var Project             = require('./models/project');
var Question            = require('./models/question');
var moment 		        = require('moment');
var userService         = require('./modules/userService');
var jwt                 = require('jsonwebtoken');
var config              = require('./modules/config');
var mongoose            = require('mongoose');
var userAccessService   = require('./modules/userAccessService');
var projectService      = require('./modules/projectService');
var questionService     = require('./modules/questionService');
var passport            = require('passport');
var async               = require('async');
var crypto 		        = require('crypto');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

function getUsers(res){
    User.find(function(err, users) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err)
        } else {
            res.json(users);
        }
    });
}

function getUser(res, id){
    User.findOne({
        _id: id
    }, function(err, user){
        if(err){
            res.send(err);
        } else {
            res.json({
                _id: user._id,
                username: user.username
            });
        }
    });
}

function findQuestionsByProject(userId, projectId, callback){
    Question.find({/*creatorUserId:userId,*/ project: projectId}, callback);
}

function deleteAndReassignParent(question, doneCallback){
    var findChildren  = function(parentId, callback){
        Question.find({parentId: parentId}, callback);
    };
    function reassignParent(newParentId, children){
        var length = children.length;
        var count = 0;
        for(var i in children){
            if(children[i].type == "STEP"){
                Question.update({
                    _id: children[i]._id
                }, {
                    parentId: newParentId
                }, function(err,result){
                    count++;
                    if (count == length){
                        doneCallback();
                    }
                })
            } else {
                Question.findByIdAndRemove(children[i]._id, function(err,result) {
                    count++;
                    if (count == length){
                        doneCallback();
                    }
                });
            }

        }
    }

    findChildren(question._id, function(err, childs){
        if(childs.length > 0) reassignParent(question.parentId, childs);
        else doneCallback();
    });
}

module.exports = function(app) {
/*
	// api ---------------------------------------------------------------------
	app.get('/api/users', function(req, res) {
        getUsers(res);
	});

    app.get('/api/users/:user_id', function(req, res){
        getUser(res, req.params.user_id);
    });

	app.post('/api/users', function(req, res) {
		// create a todo, information comes from AJAX request from Angular
        User.create({
			text : req.body.text,
			done : false,
		}, function(err, todo) {
			if (err)
				res.send(err);
			getUsers(res);
		});

	});

	app.delete('/api/users/:user_id', function(req, res) {
        User.remove({
			_id : req.params.user_id
		}, function(err, user) {
			if (err)
				res.send(err);
			getUsers(res);
		});
	});


    app.post('/api/users/login', function(req, res){
        AM.manualLogin(req.body.username, req.body.password, function(e, o){
            if (!o){
                res.status(400).send(e);
            } else{
                var token = jwt.sign(o, config.secretToken, { expiresInMinutes: 60 });
                res.json({token:token, user:{id: o._id, username: o.username, firstname: o.firstname, lastname: o.lastname}});
            }
        });
    });

    app.post("/api/users/registerUser", function(req, res) {
        AM.addNewAccount({
            username: req.body.username,
            password: req.body.password,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email
        }, function(e,o){
            if (e){
                res.status(400).send(e);
            }	else{
                var token = jwt.sign(o, config.secretToken, { expiresInMinutes: 60 });
                res.json({token:token, user:{id: o._id, username: o.username, firstname: o.firstname, lastname: o.lastname}});
            }
        });
    });*/
/*
    app.post('/api/users/login', function(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
            if (err) return next(err);
            if (!user) {
                res.status(400).send(info);
            } else {
                var token = jwt.sign(user, config.secretToken, { expiresInMinutes: 60 });
                res.json({token:token, user:{id: user._id, username: user.username, firstname: user.firstname, lastname: user.lastname}});
            }

        })(req, res, next);
    });*/

    app.post('/api/users/login', function(req, res, next){
       userService.login(req, res, next);
    });

    app.post('/api/users/registerUser', function(req, res) {
        userService.registerUser(req, res);
    });

    app.post('/api/users/forgot', function(req, res) {
       userService.forgotPassword(req, res);
    });

    app.get('/api/users/reset/:token', function(req, res) {
       userService.tokenExpired(req, res);
    });

    app.post('/api/users/reset', function(req, res) {
       userService.resetPassword(req, res);
    });

    /**
     * ---=====PROJECTS=====---
     */
    app.get('/api/projects', function(req, res){
        projectService.findUserProjects(req, res);
    });

    app.delete('/api/projects/delete/:projectId', function(req, res){
        projectService.delete(req, res);
    });

    app.get('/api/projects/:projectId', function(req, res){
        projectService.findProjectById(req, res);
    });

    app.post('/api/projects/save', function(req, res){
        projectService.save(req, res);
    });

    app.post('/api/projects/clone', function(req,res){
        projectService.clone(req, res);
    });

    app.get('/api/project/statistics/:projectId', function(req, res){
        projectService.findProjectStatistics(req, res);
    });

    app.get("/api/questions/:projectId", function(req, res){
        questionService.getQuestionsByProjectId(req, res);
    });

    app.post('/api/questions/save', function(req, res){
        questionService.save(req, res);
    });

    app.delete('/api/questions/delete/:id', function(req, res){
        questionService.delete(req, res);
    });

    app.post('/api/questionStatistics/save', function(req, res){
       projectService.saveQuestionStatistics(req, res);
    });

   /* USER ACCESS PART */
    app.post("/api/users/addAccess", function(req, res){
        verifyToken(req.headers.authorization, function(err, decoded){
            if(err) {
                res.send(err);
            } else {
                userAccessService.hasWritePermission(decoded._id, req.body.projectId, function (err, result) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        User.findOne({$or:[ { email: req.body.text }, { username: req.body.text } ]}, function(err, user){
                            if(err){
                                res.send(err);
                            } else if(user){
                                userAccessService.saveAccess(user._id, req, res);
                            } else {
                                res.status(400).send({code: "2", description: "User not found!"});
                            }

                        })
                    }
                });
            }
        });
    });

    app.get('/api/userAccess/find/:projectId', function(req, res){
        userAccessService.findProjectAccesses(req, res);
    });

    app.delete('/api/userAccess/delete/:userAccessId', function(req, res){
        verifyToken(req.headers.authorization, function(err, decoded) {
            if(err){
                res.send(err);
            } else {
                userAccessService.deleteAccess(decoded._id, req, res);
            }
        });
    });



	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});




};

function verifyToken(token, callback){
    jwt.verify(token.split(" ")[1], config.secretToken, callback);
}
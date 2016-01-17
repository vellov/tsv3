var User                = require('./models/user');
var Project             = require('./models/project');
var Question            = require('./models/question');
var moment 		        = require('moment');
var AM                  = require('./modules/account-manager');
var jwt                 = require('jsonwebtoken');
var config              = require('./modules/config');
var mongoose            = require('mongoose');
function getUsers(res){
    User.find(function(err, users) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err)
        } else {
            res.json(users);
        }
    });
};

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

function getUserProjects(userId, res){
    Project.find({$or:[
        {
            "deleted": {
                $exists:false
            }
        },
        {
            deleted:false
        }
    ]},function(err, projects) {
        if (err) {
            res.send(err);
        } else {
            res.json(projects); // return all user projects in JSON format which are not deleted
        }
    });
}

function findQuestionsByProject(userId, projectId, callback){
    Question.find({/*creatorUserId:userId,*/ projectId:projectId}, callback);
}

function deleteAndReassignParent(question, doneCallback){

    var findChildren  = function(parentId, callback){
        Question.find({parentId: parentId}, callback);
    };

    function reassignParent(newParentId, children){
        var length = children.length;
        var count = 0;
        for(var i in children){
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
        }
    }

    findChildren(question._id, function(err, childs){
        if(childs.length > 0) reassignParent(question.parentId, childs);
        else doneCallback();
    });
}

module.exports = function(app) {

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
            lastname: req.body.lastname
        }, function(e,o){
            if (e){
                res.status(400).send(e);
            }	else{
                var token = jwt.sign(o, config.secretToken, { expiresInMinutes: 60 });
                res.json({token:token, user:{id: o._id, username: o.username, firstname: o.firstname, lastname: o.lastname}});
            }
        });
    });

    app.get('/api/projects', function(req, res){
        verifyToken(req.headers.authorization, function(err, decoded){
            getUserProjects(decoded._id, res);
        });
    });

    app.delete('/api/projects/delete/:projectId', function(req,res){
        verifyToken(req.headers.authorization, function(err, decoded){
            Project.findById(req.params.projectId, function(err, project){
                if(err){
                    res.send(err);
                } else {
                    project.softdelete(function(err,deleted){
                        getUserProjects(decoded._id, res);
                    })
                }
            })
        });

    });

    app.get('/api/projects/:projectId', function(req, res){
        Project.findOne({_id:req.params.projectId},function(err, project) {
            if (err)
                res.send(err);
            res.json(project); // return all currentuser projects in JSON format
        });
    });

    app.post('/api/projects/save', function(req, res){
        verifyToken(req.headers.authorization, function(err, decoded){
            if(err){
                res.status(400).send("Something bad happened, contact with support");
            } else {
                if(req.body._id){
                    Project.findOneAndUpdate({_id: req.body._id},{
                            projectName:                req.body.projectName,
                            tags:                       req.body.tags ? req.body.tags : [],
                            defaultSuccessPageTitle:    req.body.defaultSuccessPageTitle ? req.body.defaultSuccessPageTitle : "",
                            defaultSuccessPageContent:  req.body.defaultSuccessPageContent ? req.body.defaultSuccessPageContent: "",
                            defaultSuccessPageButtonText: req.body.defaultSuccessPageButtonText ? req.body.defaultSuccessPageButtonText : "",
                            updatedAt:                  new Date(),
                            pageTitle:                  req.body.pageTitle ? req.body.pageTitle : ""
                    },
                         function(err, result){
                             if (err) {
                                 res.send(err);
                             } else {
                                 res.json(result);
                             }
                    })
                } else {
                    Project.create({
                        creatorUserId: decoded._id,
                        projectName: req.body.projectName,
                        defaultSuccessPageTitle:    req.body.defaultSuccessPageTitle ? req.body.defaultSuccessPageTitle : "",
                        defaultSuccessPageContent:  req.body.defaultSuccessPageContent ? req.body.defaultSuccessPageContent: "",
                        defaultSuccessPageButtonText: req.body.defaultSuccessPageButtonText ? req.body.defaultSuccessPageButtonText : "",
                    }, function (error, result) {
                        if (error) {
                            res.send(error);
                        } else {
                            res.json(result);
                        }

                    })
                }
            }
        });
    });

    app.get('/api/questions/:projectId', function(req, res){
        Project.findById(req.params.projectId, function(err,result){
           if(result.deleted){
               res.status(400).send({code: "1", description:"Deleted"});
           } else{
               Question.find({projectId:req.params.projectId},'_id parentId content title position projectId buttonText hasBackButton backButtonText hasFoundSolutionButton type creatorComments shortDescription', function(err, questions) {
                   if (err) {
                       res.send(err);
                   } else {
                       res.json(questions);
                   }
               });
           }
        });

    });

    app.post('/api/questions/save', function(req, res){
        verifyToken(req.headers.authorization, function(err, decoded){
            if(err){
                res.status(400).send("Something bad happened, contact with support");
            } else {
                if(req.body._id){
                    Question.update({_id:req.body._id},{
                        title: req.body.title,
                        content:req.body.content ? req.body.content : "",
                        parentId: req.body.parentId,
                        position: req.body.position,
                        buttonText: req.body.buttonText ? req.body.buttonText : "",
                        hasBackButton: req.body.hasBackButton ? req.body.hasBackButton : false,
                        backButtonText: req.body.backButtonText ? req.body.backButtonText : "",
                        hasFoundSolutionButton: req.body.hasFoundSolutionButton ? req.body.hasFoundSolutionButton : false,
                        type: req.body.type ? req.body.type: "STEP",
                        creatorComments: req.body.creatorComments ? req.body.creatorComments : "",
                        shortDescription: req.body.shortDescription ? req.body.shortDescription : ""
                    }, function(error, result){
                        if(error){
                            console.log(error);
                            res.send(error);
                        } else {
                            Question.findById(req.body._id, function(err, result){
                                if(err){
                                    res.send(error);
                                } else {
                                    res.json(result);
                                }
                            })
                        }

                    });
                }
                else {
                    Question.create({
                        creatorUserId: decoded._id,
                        projectId: req.body.projectId,
                        title: req.body.title,
                        content:req.body.content ? req.body.content : "",
                        parentId:req.body.parentId ? req.body.parentId : "",
                        position:req.body.position ? req.body.position: 0,
                        buttonText: req.body.buttonText ? req.body.buttonText : "",
                        hasBackButton: req.body.hasBackButton ? req.body.hasBackButton : false,
                        backButtonText: req.body.backButtonText ? req.body.backButtonText : "",
                        hasFoundSolutionButton: req.body.hasFoundSolutionButton ? req.body.hasFoundSolutionButton : false,
                        type: req.body.type ? req.body.type: "STEP",
                        creatorComments: req.body.creatorComments ? req.body.creatorComments : "",
                        shortDescription: req.body.shortDescription ? req.body.shortDescription : ""
                    }, function(error, result){
                        if(error){
                            res.send(error);
                        } else {
                            res.json(result);
                        }

                    });
                }

            }
        });
    });

    app.delete('/api/questions/delete/:id', function(req, res){
        verifyToken(req.headers.authorization, function(err, decoded){
            if(err){
                res.status(400).send("Something bad happened, contact with support");
            } else {
                Question.findByIdAndRemove(req.params.id, function(err, obj){
                    deleteAndReassignParent(obj, function(){
                        findQuestionsByProject(decoded._id, obj.projectId, function(err, questions) {
                            if (err) {
                                res.send(err);
                            } else {
                                res.json(questions);
                            }
                        });
                    });
                });

            }
        });
    });

    app.post('/api/questionStatistics/save', function(req, res){
        Question.findById(req.body.questionId, function(err, question){
            if(err){
                res.send(err);
            } else {
                question.statistics.push({type:req.body.type, date: Date.now()});
                question.save(function(err, result){
                    if(err){
                        res.send(err);
                    } else {
                        res.send(result);
                    }
                })
            }
        });
    });

    app.get('/api/project/statistics/:projectId', function(req, res){
        Question.find({projectId: req.params.projectId, type:"STEP"},'_id parentId title position hasFoundSolutionButton', function(err, result){
            if(err){
                res.send(err);
            } else {
                var sent = 0;
                for(var i in result){
                    var question = result[i];
                    getQuestionStatistics(question, function(){
                        sent++;
                        if(sent == result.length){
                            res.send(result);
                        }
                    });
                }
                if(result.length == 0){
                    res.send(result);
                }
            }
        })
    });

	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});




};

function getQuestionStatistics(question, callback){
    var qId = question._id;
    Question.aggregate(
        [
            { $match: { _id: qId } },
            { $unwind: "$statistics" },
            {
                $group: {
                    _id: qId,
                    views: {
                        $sum: {
                            $cond:[ { $eq:["$statistics.type", "views"] }, 1, 0]
                        }
                    },
                    foundSolution: {
                        $sum: {
                            $cond:[ { $eq:["$statistics.type", "foundSolution"] }, 1, 0]
                        }
                    }
                }
            }
        ],function(err, results){
            if(err){
                return err;
            } else {
                question.set("statisticsData", results[0], {strict:false});
                callback();
            }
        }
    );
}

function verifyToken(token, callback){
    jwt.verify(token.split(" ")[1], config.secretToken, callback);
}
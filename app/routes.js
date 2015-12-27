var User                = require('./models/user');
var Project             = require('./models/project');
var Question            = require('./models/question');
var QuestionStatistics  = require('./models/questionStatistics');
var moment 		        = require('moment');
var AM                  = require('./modules/account-manager');
var jwt                 = require('jsonwebtoken');
var config              = require('./modules/config');
function getUsers(res){
    User.find(function(err, users) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(users); // return all todos in JSON format
    });
};

function getUser(res, id){
    User.findOne({
        _id: id
    }, function(err, user){
        if(err){
            res.send(err);
        }
        res.json({
            _id:user._id,
            username: user.username
        });
    });
}
function findQuestiosnByProject(userId, projectId, callback){
    Question.find({creatorUserId:userId, projectId:projectId}, callback);
}
function deleteQuestionChildren(question, doneCallback){

    var findChildren  = function(parentId, callback){
        Question.find({parentId: parentId}, callback);
    };

    var deleteChild = function(id, callback){
        Question.findByIdAndRemove(id, callback)
    };

    var count = 0;
    var deleteChildren = function(parentId) {
        findChildren(parentId, function (err, children)  {
            count += children.length;
            for (var i in children) {
                deleteChildren(children[i]._id); // delete children
                deleteChild(children[i]._id, function (err, child) { //delete itself
                    count--;
                    if(count == 0){
                        doneCallback();
                    }
                })
            }
        })
    };

    findChildren(question._id, function(err, childs){
        if(childs.length > 0) deleteChildren(question._id);
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
            Project.find({creatorUserId:decoded._id},function(err, projects) {
                if (err)
                    res.send(err)
                res.json(projects); // return all currentuser projects in JSON format
            });
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
                Project.create({
                    creatorUserId: decoded._id,
                    projectName: req.body.projectName
                }, function(error, result){
                    if(error){
                        res.send(error);
                    } else {
                        res.json(result);
                    }

                })
            }
        });
    });

    app.get('/api/questions/:projectId', function(req, res){
        Question.find({projectId:req.params.projectId},function(err, questions) {
            if (err)
                res.send(err)
            res.json(questions); // return all currentuser projects in JSON format
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
                        content:req.body.content,
                        parentId: req.body.parentId,
                        position: req.body.position
                    }, function(error, result){
                        if(error){
                            res.send(error);
                        } else {
                            findQuestiosnByProject(decoded._id, req.body.projectId, function(err, questions) {
                                if (err)
                                    res.send(err);
                                res.json(questions);
                            });
                        }

                    });
                }
                else {
                    Question.create({
                        creatorUserId: decoded._id,
                        projectId: req.body.projectId,
                        title: req.body.title,
                        content:req.body.content,
                        parentId:req.body.parentId ? req.body.parentId : "",
                        position:req.body.position ? req.body.position: 0
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
                    deleteQuestionChildren(obj, function(){
                        findQuestiosnByProject(decoded._id, obj.projectId, function(err, questions) {
                            if (err)
                                res.send(err);
                            res.json(questions);
                        });
                    });
                });

            }
        });
    });

    app.post('/api/questionStatistics/save', function(req, res){
        var toInc;
        if(req.body.type == "VIEW"){
            toInc = { views: 1};
        } else if(req.body.type == "FORWARD"){
            toInc = { forward: 1};
        } else if(req.body.type == "BACK"){
            toInc = {back: 1};
        }
        QuestionStatistics.findOneAndUpdate(
            { questionId: req.body.questionId}, // find question statistic
            { $inc: toInc }, // update according to type
            { upsert: true} // creates new if didn't find any
        )
    });

	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});


    // PROJECTS (questions)


};

function verifyToken(token, callback){
    jwt.verify(token.split(" ")[1], config.secretToken, callback);
}
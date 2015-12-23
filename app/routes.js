var User        = require('./models/user');
var Project     = require('./models/project');
var Question    = require('./models/question');
var moment 		= require('moment');
var AM          = require('./modules/account-manager');
var jwt         = require('jsonwebtoken');
var config      = require('./modules/config');
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
                res.json({token:token, user:{id: o._id, username: o.username}});
            }
        });
    });

    app.post("/api/users/registerUser", function(req, res) {
        AM.addNewAccount({
            username: req.body.username,
            password: req.body.password
        }, function(e,o){
            if (e){
                res.status(400).send(e);
            }	else{
                var token = jwt.sign(o, config.secretToken, { expiresInMinutes: 60 });
                res.json({token:token, user:{id: o._id, username: o.username}});
            }
        });
    });

    app.get('/api/projects', function(req, res){
        verifyToken(req.headers.authorization, function(err,decoded){
            Project.find({creatorUserId:decoded._id},function(err, projects) {
                if (err)
                    res.send(err)
                res.json(projects); // return all currentuser projects in JSON format
            });
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
        verifyToken(req.headers.authorization, function(err,decoded){
            Question.find({creatorUserId:decoded._id, projectId:req.params.projectId},function(err, questions) {
                if (err)
                    res.send(err)
                res.json(questions); // return all currentuser projects in JSON format
            });
        });
    });

    app.post('/api/questions/save', function(req, res){
        verifyToken(req.headers.authorization, function(err, decoded){
            if(err){
                res.status(400).send("Something bad happened, contact with support");
            } else {
                console.log(req.body);
                Question.create({
                    creatorUserId: decoded._id,
                    projectId: req.body.projectId,
                    title: req.body.title,
                    content:req.body.content,
                    parentId:req.body.parentId
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


	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});


    // PROJECTS (questions)


};

function verifyToken(token, callback){
    jwt.verify(token.split(" ")[1], config.secretToken, callback);
}
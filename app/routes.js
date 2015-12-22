var User        = require('./models/user');
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

	// create todo and send back all todos after creation
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

	// delete a todo
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
        }, function(e){
            if (e){
                res.status(400).send(e);
            }	else{
                res.status(200).send('ok');
            }
        });
    });
	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});
};
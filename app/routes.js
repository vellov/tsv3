var User = require('./models/user');

function getUsers(res){
    User.find(function(err, users) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(users); // return all todos in JSON format
    });
};

module.exports = function(app) {

	// api ---------------------------------------------------------------------
	// get all todos
	app.get('/api/users', function(req, res) {

		// use mongoose to get all todos in the database
		getUsers(res);
	});

	// create todo and send back all todos after creation
	app.post('/api/users', function(req, res) {

		// create a todo, information comes from AJAX request from Angular
        User.create({
			text : req.body.text,
			done : false
		}, function(err, todo) {
			if (err)
				res.send(err);
			// get and return all the todos after you create another
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

	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});
};
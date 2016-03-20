// set up ======================================================================
var env = require('./env.js');
var express  = require('express');
var app      = express(); 								// create our app w/ express
var mongoose = require('mongoose'); 					// mongoose for mongodb
var port  	 = process.env.PORT || 8080; 				// set the port
var database = require('./config/database'); 			// load the database config
var morgan   = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

//Password recovery.
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var nodemailer = require('nodemailer');
var passport = require('passport');
var BasicStrategy = require('passport-http').Strategy;
var async = require('async');
var crypto = require('crypto');


// configuration ===============================================================
mongoose.connect(database.url); 	// connect to mongoDB database on modulus.io

app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json({ limit: '50mb' })); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' , limit: '50mb' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request

//Password recovery
app.use(cookieParser());
app.use(session({
    secret: 'session secret key',
    resave: true,
    saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// routes ======================================================================
require('./app/routes.js')(app);

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);

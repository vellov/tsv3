var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
	username : {type : String, default: ''},
    firstname: {type : String, default: ''},
    lastname: {type : String, default: ''},
    password: {type: String, default:''}
});
var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
	text : {type : String, default: 'username'}
});
var mongoose = require('mongoose');

module.exports = mongoose.model('UserAccess', {
    userId:     { type: String },
    projectId:  { type: String },
    write:      { type: Boolean, default: false}
});
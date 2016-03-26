var mongoose = require('mongoose');

module.exports = mongoose.model('UserAccess', {
    user:     [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    project:  { type: mongoose.Schema.Types.ObjectId, ref: "Project"}
});
var mongoose = require('mongoose');

module.exports = mongoose.model('Project', {
    creatorUser:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title:          { type: String, default: "" }
});
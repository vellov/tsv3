var mongoose = require('mongoose');

module.exports = mongoose.model('Project', {
    projectName: {type: String, default:""},
    creatorUserId: {type: String, default:""}
});

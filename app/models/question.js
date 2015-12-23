var mongoose = require('mongoose');

module.exports = mongoose.model('Question', {
    projectId:      { type: String, default: "" },
    creatorUserId:  { type: String, default: "" },
    parentId:       { type: String, default: "" },
    content:        { type: String, default: "" },
    title:          { type: String, default: "" }
});

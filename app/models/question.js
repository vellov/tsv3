var mongoose = require('mongoose');

module.exports = mongoose.model('Question', {
    projectId:      { type: String, default: "" },
    creatorUserId:  { type: String, default: "" },
    parentId:       { type: String, default: "" },
    content:        { type: String, default: "" },
    title:          { type: String, default: "" },
    position:       { type: Number, default: 0},
    statistics: {
        views:             { type: Number, default: 0},
        forward:           { type: Number, default: 0},
        back:              { type: Number, default: 0}
    }
});

var mongoose = require('mongoose');

module.exports = mongoose.model('Question', {
    projectId:      { type: String, default: "" },
    creatorUserId:  { type: String, default: "" },
    parentId:       { type: String, default: "" },
    content:        { type: String, default: "" },
    title:          { type: String, default: "" },
    position:       { type: Number, default: 0},
    statistics: [{
        type:       {type: String, default: ""},
        date:       {type: Date, default: ""}
    }]
});
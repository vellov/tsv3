var mongoose = require('mongoose');

module.exports = mongoose.model('Question', {
    projectId:      { type: String, default: "" },
    creatorUserId:  { type: String, default: "" },
    parentId:       { type: String, default: "" },
    content:        { type: String, default: "" },
    title:          { type: String, default: "" },
    position:       { type: Number, default: 0},
    buttonText:     { type: String, default: "" },
    hasBackButton:  { type: Boolean, default: false},
    backButtonText: { type: String, default: ""},
    statistics: [{
        type:       {type: String, default: ""},
        date:       {type: Date, default: ""}
    }]
});
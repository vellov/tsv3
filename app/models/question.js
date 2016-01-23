var mongoose = require('mongoose');

module.exports = mongoose.model('Question', {
    project:        { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    creatorUser:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    parentId:       { type: String, default: "" },
    content:        { type: String, default: "" },
    title:          { type: String, default: "" },
    position:       { type: Number, default: 0},
    buttonText:     { type: String, default: "" },
    hasBackButton:  { type: Boolean, default: false},
    backButtonText: { type: String, default: ""},
    hasFoundSolutionButton: { type: Boolean, default: false},
    type:           {type:String, default: "STEP"},
    creatorComments: {type: String, default:""},
    shortDescription: {type: String, default:""},
    statistics: [{
        type:       {type: String, default: ""},
        date:       {type: Date, default: ""}
    }]
});
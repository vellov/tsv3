var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var options = { select: true };
var projectSchema = new Schema({
    projectName:               { type: String, default: "" },
    creatorUserId:             { type: String, default: "" },
    deleted:                   { type: Boolean, default: false },
    deletedAt:                 { type: Date, default: "" },
    tags:                      { type: Array, default: [] },
    defaultSuccessPageTitle:   { type: String, default: "" },
    defaultSuccessPageContent: { type: String, default: "" },
    createdAt:                 { type: Date },
    updatedAt:                 { type: Date }
});
projectSchema.pre('save', function (next) {
    if (!this.deleted) {
        this.deleted = false;
    }
    if (!this.deletedAt) {
        this.deletedAt = null;
    }
    var now = new Date();
    if( !this.createdAt){
        this.createdAt = now;
    }

    next();
});


projectSchema.methods.softdelete = function(callback) {
    this.deleted = true;
    this.deletedAt = new Date();
    this.save(callback);
};

projectSchema.methods.restore = function(callback) {
    this.deleted = false;
    this.deletedAt = null;
    this.save(callback);
};


module.exports = mongoose.model('Project', projectSchema);

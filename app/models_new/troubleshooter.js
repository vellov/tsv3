var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var options = { select: true };
var troubleshooterSchema = new Schema({
    project:                   { type: mongoose.Schema.Types.ObjectId, ref: "Project"},
    creatorUser:               { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name:                      { type: String, default: "" },
    deleted:                   { type: Boolean, default: false },
    deletedAt:                 { type: Date, default: "" },
    tags:                      { type: Array, default: [] },
    defaultSuccessPageTitle:   { type: String, default: "" },
    defaultSuccessPageContent: { type: String, default: "" },
    defaultSuccessPageButtonText: { type: String, default: "" },
    pageTitle:                 { type: String, default: ""},
    createdAt:                 { type: Date },
    updatedAt:                 { type: Date },
    lastModifier:              { type: mongoose.Schema.Types.ObjectId, ref: "User"}
});
troubleshooterSchema.pre('save', function (next) {
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


troubleshooterSchema.methods.softdelete = function(callback) {
    this.deleted = true;
    this.deletedAt = new Date();
    this.save(callback);
};

troubleshooterSchema.methods.restore = function(callback) {
    this.deleted = false;
    this.deletedAt = null;
    this.save(callback);
};


module.exports = mongoose.model('Troubleshooter', troubleshooterSchema);

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statisticsSchema = new Schema({
    step:               { type: mongoose.Schema.Types.ObjectId, ref: "Step" },
    troubleshooter:     { type: mongoose.Schema.Types.ObjectId, ref: "Troubleshooter" },
    type:               { type: String },
    date:               { type: Date }
});

statisticsSchema.pre('save', function (next) {
    var now = new Date();
    if( !this.date){
        this.date = now;
    }
    next();
});

module.exports = mongoose.model('Statistics', statisticsSchema);

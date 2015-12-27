/**
 * Created by vellovaherpuu on 27/12/15.
 */
var mongoose = require('mongoose');

module.exports = mongoose.model('QuestionStatistics', {
    questionId:        { type: String, default: "" },
    views:             { type: Number, default: 0},
    forward:           { type: Number, default: 0},
    back:              { type: Number, default: 0}
});

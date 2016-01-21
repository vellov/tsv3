var UserAccess        = require('../models/userAccess');
var Project           = require('../models/project');
var User              = require('../models/user');

var exports = module.exports = { };



exports.hasAccess = function(userId, projectId, successCallback, errorCallback){
    successCallback(["567aec441e77b63e1129e00b"]);
};





function findProjects(userId, UAS, successCallback, errorCallback) {
    Project.find({
        $or:[
            { creatorUserId: userId },
            {_id: {$in: UAS.map(function(UA){return UA.projectId})}}
        ]
    }, function(err, projects){
        err ? errorCallback(err) : successCallback(projects);
    });
}

exports.findProjectsWithAccess = function(userId, successCallback, errorCallback) {
    UserAccess.find({userId: userId}, function(err, userAccesses){
        if(err){
            errorCallback(err);
        } else {
            findProjects(userId, userAccesses, successCallback, errorCallback)
        }
    })
};




exports.saveAccess = function(userId, req, res, successCallback, errorCallback){
    UserAccess.find({
        projectId: req.body.projectId,
        userId: userId
    }, function(err, result){
        if(err){
            errorCallback(err);
        } else if(result.length == 0){
            UserAccess.create({
                projectId: req.body.projectId,
                userId: userId,
                write: req.body.write ? true : false
            }, function(err, result){
                err ? errorCallback(err) : successCallback(result);
            });
        } else {
            successCallback();
        }
    });

};

exports.deleteAccess = function() {
    console.log("deleteAccess");
};
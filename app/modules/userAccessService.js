var UserAccess        = require('../models/userAccess');
var Project           = require('../models/project');
var User              = require('../models/user');
var mongoose          = require('mongoose');
var exports = module.exports = { };

function toObjId(id){
    if(mongoose.Types.ObjectId.isValid(id)){
        return id;
    } else {
        var id2 = mongoose.Schema.Types.ObjectId(id);
        if(mongoose.Types.ObjectId.isValid(id2)){
            return id2;
        } else {
            return id; //should return error tho
        }
    }
}

exports.hasAccess = function(userId, projectId, successCallback, errorCallback){
    successCallback(["567aec441e77b63e1129e00b"]);
};

exports.hasWritePermission = function(userId, projectId, callback) {
    UserAccess.find({
        user: userId,
        project: mongoose.Types.ObjectId(projectId),
        write: true
    }, function(err, result){
        if(err){
            callback(err);
        } else if (result.length){
            findProjects(userId, result, function(projects){ callback(null,projects) }, callback);
        } else {
            callback({code: "3", description: "User has no write access"})
        }
    });
};

function findProjects(userId, UAS, successCallback, errorCallback) {
    Project.find({
        $and:[
            { $or:[
                { creatorUser: userId }, {_id: { $in: UAS.map(function(UA){ return UA.project })}}
            ]},
            { $or:[
                { deleted: false }, { deleted: { $exists: false } }
            ]}
        ]
    }, function(err, projects){
        err ? errorCallback(err) : successCallback(projects);
    });
}

exports.findProjectsWithAccess = function(userId, successCallback, errorCallback) {
    UserAccess.find({user: userId}, function(err, userAccesses){
        if(err){
            errorCallback(err);
        } else {
            findProjects(userId, userAccesses, successCallback, errorCallback)
        }
    })
};




exports.saveAccess = function(userId, req, res){
    UserAccess.find({
        project: mongoose.Types.ObjectId(req.body.projectId),
        user: userId
    }, function(err, result){
        if(err){
            res.send(err);
        } else if(result.length == 0){
            UserAccess.create({
                project: mongoose.Types.ObjectId(req.body.projectId),
                user: userId,
                write: req.body.write ? true : false
            }, function(err, result){
                err ? res.send(err) : res.send(result);
            });
        } else {
            res.send("OK");
        }
    });

};

exports.deleteAccess = function() {
    console.log("deleteAccess");
};



exports.findProjectAccesses = function(req, res){
    UserAccess.find({project: mongoose.Types.ObjectId(req.params.projectId)})
        .populate("user", "_id firstname lastname email")
        .exec(function(err, result){
            if(err){
                res.send(err);
            } else {
                res.send(result);
            }
        });
};
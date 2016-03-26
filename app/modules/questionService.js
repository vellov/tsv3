var async             = require('async');
var UserAccess        = require('../models/userAccess');
var Project           = require('../models/project');
var User              = require('../models/user');
var Question          = require('../models/question');
var mongoose          = require('mongoose');
var utils             = require('../utils');
var UserAccessService = require('../modules/userAccessService');

var exports = module.exports = { };

exports.getQuestionsByProjectId = function(req, res){
    Project.findById(mongoose.Types.ObjectId(req.params.projectId), function(err, result){
        if(result.deleted){
            res.status(400).send({code: "1", description:"Deleted"});
        } else {
            Question.find({project: mongoose.Types.ObjectId(req.params.projectId)},'_id parentId content title position project buttonText hasBackButton backButtonText hasFoundSolutionButton type creatorComments shortDescription', function(err, questions) {
                if (err) {
                    res.send(err);
                } else {
                    res.json(questions);
                }
            });
        }
    });
};

exports.save = function(req, res){
        utils.verifyToken(req.headers.authorization, function(err, decoded){
            if(err){
                res.status(400).send("Something bad happened, contact with support");
            } else {
                if(req.body._id){
                    Question.update({_id:req.body._id},{
                        title: req.body.title,
                        content:req.body.content ? req.body.content : "",
                        parentId: req.body.parentId ? mongoose.Types.ObjectId(req.body.parentId) : null,
                        position: req.body.position,
                        buttonText: req.body.buttonText ? req.body.buttonText : "",
                        hasBackButton: req.body.hasBackButton ? req.body.hasBackButton : false,
                        backButtonText: req.body.backButtonText ? req.body.backButtonText : "",
                        hasFoundSolutionButton: req.body.hasFoundSolutionButton ? req.body.hasFoundSolutionButton : false,
                        type: req.body.type ? req.body.type: "STEP",
                        creatorComments: req.body.creatorComments ? req.body.creatorComments : "",
                        shortDescription: req.body.shortDescription ? req.body.shortDescription : ""
                    }, function(error){
                        if(error){
                            res.send(error);
                        } else {
                            Question.findById(req.body._id, function(err, result){
                                if(err){
                                    res.send(error);
                                } else {
                                    res.json(result);
                                }
                            })
                        }

                    });
                }
                else {
                    Question.create({
                        creatorUser: decoded._id,
                        project: req.body.projectId,
                        title: req.body.title,
                        content:req.body.content ? req.body.content : "",
                        parentId: req.body.parentId ? mongoose.Types.ObjectId(req.body.parentId) : null,
                        position:req.body.position ? req.body.position: 0,
                        buttonText: req.body.buttonText ? req.body.buttonText : "",
                        hasBackButton: req.body.hasBackButton ? req.body.hasBackButton : false,
                        backButtonText: req.body.backButtonText ? req.body.backButtonText : "",
                        hasFoundSolutionButton: req.body.hasFoundSolutionButton ? req.body.hasFoundSolutionButton : false,
                        type: req.body.type ? req.body.type: "STEP",
                        creatorComments: req.body.creatorComments ? req.body.creatorComments : "",
                        shortDescription: req.body.shortDescription ? req.body.shortDescription : ""
                    }, function(error, result){
                        if(error){
                            res.send(error);
                        } else {
                            res.json(result);
                        }

                    });
                }

            }
        });
};

exports.delete = function(req, res){
    utils.verifyToken(req.headers.authorization, function(err, decoded){
        if(err){
            res.status(400).send("Something bad happened, contact with support");
        } else {
            Question.findByIdAndRemove(req.params.id, function(err, obj){
                deleteAndReassignParent(obj, function(){
                    findQuestionsByProject(decoded._id, obj.project, function(err, questions) {
                        if (err) {
                            res.send(err);
                        } else {
                            res.json(questions);
                        }
                    });
                });
            });

        }
    });
};

function deleteAndReassignParent(question, doneCallback){
    var findChildren  = function(parentId, callback){
        Question.find({parentId: parentId}, callback);
    };
    function reassignParent(newParentId, children){
        var length = children.length;
        var count = 0;
        for(var i in children){
            if(children[i].type == "STEP"){
                Question.update({
                    _id: children[i]._id
                }, {
                    parentId: newParentId
                }, function(err,result){
                    count++;
                    if (count == length){
                        doneCallback();
                    }
                })
            } else {
                Question.findByIdAndRemove(children[i]._id, function(err,result) {
                    count++;
                    if (count == length){
                        doneCallback();
                    }
                });
            }

        }
    }

    findChildren(question._id, function(err, childs){
        if(childs.length > 0) reassignParent(question.parentId, childs);
        else doneCallback();
    });
}

function findQuestionsByProject(userId, projectId, callback){
    Question.find({/*creatorUserId:userId,*/ project: projectId}, callback);
}

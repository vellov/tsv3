var async             = require('async');
var UserAccess        = require('../models/userAccess');
var Project           = require('../models/project');
var User              = require('../models/user');
var Question          = require('../models/question');
var mongoose          = require('mongoose');
var utils             = require('../utils');
var UserAccessService = require('../modules/userAccessService');

var exports = module.exports = { };


function getQuestionStatistics(question, callback){
    var qId = question._id;
    Question.aggregate(
        [
            { $match: { _id: qId } },
            { $unwind: "$statistics" },
            {
                $group: {
                    _id: qId,
                    views: {
                        $sum: {
                            $cond:[ { $eq:["$statistics.type", "views"] }, 1, 0]
                        }
                    },
                    foundSolution: {
                        $sum: {
                            $cond:[ { $eq:["$statistics.type", "foundSolution"] }, 1, 0]
                        }
                    }
                }
            }
        ],function(err, results){
            if(err){
                return err;
            } else {
                question.set("statisticsData", results[0], {strict:false});
                callback();
            }
        }
    );
}
/**
 * Returns project Statistics
 * @param req
 * @param res
 */
exports.findProjectStatistics = function(req, res) {
    utils.verifyToken(req.headers.authorization, function(err, decoded){
        if(err){
            res.status(400).send(err);
        } else {
            UserAccessService.hasAccess(decoded._id, req.params.projectId, function(err, result){
                if(err){
                    res.status(400).send(err);
                } else if(result.length == 0) {
                    res.status(400).send({code:5, description: "No access"});
                } else {
                    Question.find({project: mongoose.Types.ObjectId(req.params.projectId), type:"STEP"},'_id parentId title position hasFoundSolutionButton', function(err, result){
                        if(err){
                            res.send(err);
                        } else {
                            var sent = 0;
                            for(var i in result){
                                var question = result[i];
                                getQuestionStatistics(question, function(){
                                    sent++;
                                    if(sent == result.length){
                                        res.send(result);
                                    }
                                });
                            }
                            if(result.length == 0){
                                res.send(result);
                            }
                        }
                    })
                }
            });
        }
    });
};

/**
 * Save question Statistics (visit and found solution)
 * @param req
 * @param res
 */
exports.saveQuestionStatistics = function(req, res){
    Question.findById(req.body.questionId, function(err, question){
        if(err){
            res.send(err);
        } else {
            question.statistics.push({type:req.body.type, date: Date.now()});
            question.save(function(err, result){
                if(err){
                    res.send(err);
                } else {
                    res.send(result);
                }
            })
        }
    });
};

/**
 * Create & Update Projects
 * @param req
 * @param res
 */
exports.save = function(req, res){
    utils.verifyToken(req.headers.authorization, function(err, decoded){
        if(err){
            res.status(400).send("Authentication failed");
        } else {
            if(req.body._id){
                Project.findOneAndUpdate({_id: req.body._id},{
                        projectName:                req.body.projectName,
                        tags:                       req.body.tags ? req.body.tags : [],
                        defaultSuccessPageTitle:    req.body.defaultSuccessPageTitle ? req.body.defaultSuccessPageTitle : "",
                        defaultSuccessPageContent:  req.body.defaultSuccessPageContent ? req.body.defaultSuccessPageContent: "",
                        defaultSuccessPageButtonText: req.body.defaultSuccessPageButtonText ? req.body.defaultSuccessPageButtonText : "",
                        updatedAt:                  new Date(),
                        pageTitle:                  req.body.pageTitle ? req.body.pageTitle : ""
                    },
                    function(err, result){
                        if (err) {
                            res.send(err);
                        } else {
                            res.json(result);
                        }
                    })
            } else {
                Project.create({
                    creatorUser: decoded._id,
                    projectName: req.body.projectName,
                    defaultSuccessPageTitle: req.body.defaultSuccessPageTitle ? req.body.defaultSuccessPageTitle : "",
                    defaultSuccessPageContent: req.body.defaultSuccessPageContent ? req.body.defaultSuccessPageContent: "",
                    defaultSuccessPageButtonText: req.body.defaultSuccessPageButtonText ? req.body.defaultSuccessPageButtonText : "",
                }, function (error, result) {
                    if (error) {
                        res.send(error);
                    } else {
                        res.json(result);
                    }

                })
            }
        }
    });
};

function cloneQuestions(originalProjectId, clonedProject, res){
    var count = 0;

    //Save root -> save children etc using recursion.
    function saveTree(root, parent, callback){
        //Assign new values before saving
        root._id = mongoose.Types.ObjectId();
        root.project = clonedProject._id;
        root.parentId = parent;
        delete root.statistics;

        Question.create(root, function(err, result){
            count--;
            if(err){
                callback(err);
            } else {
                if(root.children.length > 0){
                    async.each(root.children, function(child, acb){
                        saveTree(child, result._id, callback);
                        acb(); //async callback
                    });
                } else {
                    if(count <= 0){
                        callback();
                    }
                }
            }
        });
    }

    Question.find({ project: originalProjectId }).lean().exec(function(err, questions){
        if(err){
            res.send(err);
        } else {
            count = questions.length;
            var questionTree = utils.listToTree(questions, {
                idKey: "_id",
                parentKey: "parentId",
                childrenKey: "children"
            });
            if(questionTree[0]){
                saveTree(questionTree[0], null, function(err){
                    if(err) {
                        res.send(err);
                    } else {
                        res.send(clonedProject);
                    }
                });
            } else {
                res.send(clonedProject);
            }
        }
    });
}

exports.clone = function(req, res){
    utils.verifyToken(req.headers.authorization, function(err, decoded){
        if(err){
            res.status(400).send("Authentication failed");
        } else {
            Project.findById(req.body.id, function(err, originalProject){
                if(err){
                    res.status(400).send("Project not found!");
                } else {
                    Project.create({
                        creatorUser: decoded._id,
                        projectName: originalProject.projectName + "_CLONE",
                        defaultSuccessPageTitle: originalProject.defaultSuccessPageTitle,
                        defaultSuccessPageContent: originalProject.defaultSuccessPageContent,
                        defaultSuccessPageButtonText: originalProject.defaultSuccessPageButtonText,
                        tags: originalProject.tags
                    }, function(err, clonedProject){
                        if(err) {
                            res.status(400).send(err);
                        } else {
                            cloneQuestions(originalProject._id, clonedProject, res);
                        }
                    });
                }

            });

        }
    })
};

exports.findProjectById = function(req, res) {
    Project.findOne({_id: mongoose.Types.ObjectId(req.params.projectId)},function(err, project) {
        if (err) {
            res.send(err);
        } else {
            res.json(project);
        }
    });
};


function getUserProjects(userId, res){
    UserAccessService.findProjectsWithAccess(userId, function(projects){
        res.send(projects);
    }, function(err){
        res.send(err);
    });
}

exports.delete = function(req, res) {
    utils.verifyToken(req.headers.authorization, function(err, decoded){
        Project.findById(req.params.projectId, function(err, project){
            if(err){
                res.send(err);
            } else {
                project.softdelete(function(err, deleted){
                    getUserProjects(decoded._id, res);
                })
            }
        })
    });
};

exports.findUserProjects = function(req, res){
    utils.verifyToken(req.headers.authorization, function(err, decoded){
        getUserProjects(decoded._id, res);
    });
};
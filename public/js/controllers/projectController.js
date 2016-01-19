var app = window.angular.module("troubleshooting");

app.controller("projectController", ["$scope","projectService", "userService", "project", "questions", "$location", "utils", function($scope, projectService, userService, project, questions, $location, utils){
    $scope.currentUser = userService.getCurrentUser();
    $scope.project = project;
    $scope.questions = questions ? questions : [];
    $scope.projectEditData = { };
    $scope.showForm = false;
    $scope.editorOptions = {
        language: 'et'
    };
    $scope.viewData = {};
    $scope.$location = $location;
    $scope.sortedData = [];
    $scope.treeOptions = {
        accept: function(sourceNodeScope, destNodesScope, destIndex) {
            return destNodesScope.$nodeScope; //Keela 0 tasemele liigutamine
        },
        dropped: function(event){
            var data = event.source.nodeScope.$modelValue;
            data.parentId = event.dest.nodesScope.$nodeScope.$modelValue._id;

            var siblings = listToTree.GetItemById(data.parentId).children;
            for(var i in siblings){
                siblings[i].position = i;
                projectService.saveQuestion(siblings[i]).then(function(d){
                    updateData(d.data);
                });
            }

        },
        beforeDrag: function(source){
            return source.$modelValue.parentId != ""; //Keela juure liigutamine
        }
    };

    function updateData(question){
        for (var i in $scope.questions){ //May need opt;
            if($scope.questions[i]._id == question._id){
                $scope.questions[i] = question;
                break;
            }
        }
    }

    $scope.saveQuestion = function(){
        var data = angular.extend({projectId: project._id}, $scope.projectEditData);
        var siblings = listToTree.GetItemById(data.parentId).children;
        if(!data._id) {
            if (siblings) {
                data.position = siblings.length;
            } else {
                data.position = 0;
            }
        }
        projectService.saveQuestion(data).then(function(d){
            if(data._id){
                updateData(d.data);
            } else {
                $scope.questions.push(d.data);
            }

            if(data.hasFoundSolutionButton){
                var successPageData = {
                    projectId: project._id,
                    parentId: d.data._id,
                    content: $scope.projectEditData.hasFoundSolutionText ? $scope.projectEditData.hasFoundSolutionText : project.defaultSuccessPageContent,
                    type: "SUCCESS",
                    title: $scope.projectEditData.hasFoundSolutionTitle ? $scope.projectEditData.hasFoundSolutionTitle : project.defaultSuccessPageTitle,
                    buttonText:  $scope.projectEditData.hasFoundSolutionButtonText ? $scope.hasFoundSolutionButtonText : project.defaultSuccessPageButtonText,
                    position: 0
                };

                var successStep = utils.findSuccessStepByParentId($scope.questions, data._id);
                if(successStep) {
                    successPageData._id = successStep._id;
                }

                projectService.saveQuestion(successPageData).then(function(d){
                    if(successStep) {
                        for (var i in $scope.questions) { //May need opt;
                            if ($scope.questions[i]._id == d.data._id) {
                                $scope.questions[i] = d.data;
                                break;
                            }
                        }
                    } else {
                        $scope.questions.push(d.data);
                    }
                });

            }

            $scope.projectEditData = { };
            $scope.showForm = false;
            delete $scope.viewData.activeId;
        })
    };

    $scope.add = function(id){
        var siblings = listToTree.GetItemById(id).children;
        var pos = siblings ? siblings.length : 0;
        var data = {
            parentId: id,
            title: "Uus samm",
            projectId: project._id,
            position:pos
        };
        projectService.saveQuestion(data).then(function(d){
           $scope.questions.push(d.data);
        });
    };

    $scope.delete = function(question){
       utils.confirm("Oled kindel, et tahad ära kustutada?", "Kustutamisel jäävad alamsammud alles :)",
           function(){
               projectService.deleteQuestion(question._id).then(function(d){
                   $scope.questions = d.data;
               });
           }, null, "Kustuta", "Tagasi");
    };

    $scope.edit = function(question){
        $scope.projectEditData = angular.copy(question);
        $scope.showForm = true;
        $scope.viewData.activeId = question._id;
        if(question.hasFoundSolutionButton){
            var successStep = utils.findSuccessStepByParentId($scope.questions, question._id);
            if(successStep) {
                $scope.projectEditData.hasFoundSolutionText = successStep.content;
                $scope.projectEditData.hasFoundSolutionTitle = successStep.title;
                $scope.projectEditData.hasFoundSolutionButtonText = successStep.buttonText;
            }
        } else {
            $scope.projectEditData.hasFoundSolutionText =  project.defaultSuccessPageContent;
            $scope.projectEditData.hasFoundSolutionTitle = project.defaultSuccessPageTitle;
            $scope.projectEditData.hasFoundSolutionButtonText = project.defaultSuccessPageButtonText;
        }
    };


    $scope.logout = function() {
        userService.logout();
    };

    var listToTree; //contains all questions
    var sortedTree; // doesn't contain success questions
    $scope.$watch(function(){
        return $scope.questions;
    }, function(n){
        listToTree = new LTT(n,
            {
                key_id: "_id",
                key_parent: "parentId",
                position: "position"
            }
        );
        var arr = [];
        for(var i in n){
            if(n[i].type != "SUCCESS"){
                arr.push(n[i]);
            }
        }
        sortedTree = new LTT(arr,{
                key_id: "_id",
                key_parent: "parentId",
                position: "position"
            }
        );
        $scope.sortedData = sortedTree.GetTree();
    },true);

}]);
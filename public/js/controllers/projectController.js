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

            var siblings = listToTree.GetItemById(data.parentId).child;
            for(var i in siblings){
                 siblings[i].position = i;
                 projectService.saveQuestion(siblings[i]);
            }

        },
        beforeDrag: function(source){
            return source.$modelValue.parentId != ""; //Keela juure liigutamine
        }
    };


    $scope.saveQuestion = function(){
        var data = angular.extend({projectId: project._id}, $scope.projectEditData);
        var siblings = listToTree.GetItemById(data.parentId).child;
        if(siblings){
            data.position = siblings.length;
        } else {
            data.position = 0;
        }
        projectService.saveQuestion(data).then(function(d){
            if(data._id){
                for (var i in $scope.questions){ //May need opt;
                    if($scope.questions[i]._id == data._id){
                        $scope.questions[i] = d.data;
                        break;
                    }
                }
            } else {
                $scope.questions.push(d.data);
            }

            $scope.projectEditData = { };
            $scope.showForm = false;
            delete $scope.viewData.activeId;
            delete $scope.viewData.addingId;
        })
    };

    $scope.add = function(id){
        $scope.projectEditData = { };
        $scope.showForm = true;
        $scope.projectEditData.parentId = id;
        delete $scope.viewData.activeId;
        $scope.viewData.addingId = id;
    };

    $scope.delete = function(question){
       if(question._confirmDelete){
           projectService.deleteQuestion(question._id).then(function(d){
               $scope.questions = d.data;
           })
       } else {
           question._confirmDelete = true;
       }
    };

    $scope.edit = function(question){
        $scope.projectEditData = angular.copy(question);
        $scope.showForm = true;
        delete $scope.viewData.addingId;
        $scope.viewData.activeId = question._id;
    };


    $scope.logout = function(){
        userService.logout();
    };

    var listToTree;
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
        $scope.sortedData = listToTree.GetTree();
    },true);

}]);
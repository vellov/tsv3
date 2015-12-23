var app = window.angular.module("troubleshooting");

app.controller("projectController", ["$scope","projectService", "userService", "project", "questions", "$location", function($scope, projectService, userService, project, questions, $location){
    $scope.currentUser = userService.getCurrentUser();
    $scope.project = project;
    $scope.questions = questions;
    $scope.projectEditData = { };
    $scope.showForm = false;
    $scope.editorOptions = {};
    $scope.viewData = {};
    $scope.$location = $location;
    $scope.saveQuestion = function(){
        var data = angular.extend({projectId: project._id}, $scope.projectEditData);
        projectService.saveQuestion(data).then(function(d){
            if(data._id){
                $scope.questions = d.data;
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

}]);
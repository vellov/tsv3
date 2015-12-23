var app = window.angular.module("troubleshooting");

app.controller("projectController", ["$scope","projectService", "userService", "project", "questions", function($scope, projectService, userService, project, questions){
    $scope.currentUser = userService.getCurrentUser();
    $scope.project = project;
    $scope.questions = questions;
    $scope.projectEditData = { };
    $scope.showForm = false;
    $scope.editorOptions = {
    };

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
        })
    };

    $scope.add = function(id){
        $scope.projectEditData = { };
        $scope.showForm = true;
        $scope.projectEditData.parentId = id;
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
    };


    $scope.logout = function(){
        userService.logout();
    };

}]);
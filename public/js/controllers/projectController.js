var app = window.angular.module("troubleshooting");

app.controller("projectController", ["$scope","projectService","$stateParams", "userService", function($scope, projectService, $stateParams, userService){
    $scope.currentUser = userService.getCurrentUser();
    $scope.projectEditData = { };
    $scope.questions = [];

    $scope.editorOptions = {
    };

    projectService.getProjectQuestions($stateParams.projectId).then(function(d){
        $scope.questions = d.data;
        console.log($scope.questions);
    });

    $scope.saveQuestion = function(){
        var data = angular.extend({projectId: $stateParams.projectId}, $scope.projectEditData);
        projectService.saveQuestion(data).then(function(d){
            $scope.questions.push(d.data);
            $scope.projectEditData = { };
            console.log($scope.questions);

        })
    };

    $scope.add = function(id){
        $scope.projectEditData.parentId = id;
    };



    $scope.logout = function(){
        userService.logout();
    };



}]);
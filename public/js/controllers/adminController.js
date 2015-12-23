var app = window.angular.module("troubleshooting");

app.controller("adminController", ["$scope", "userService","projectService", "$state", "$location", function($scope, userService, projectService, $state, $location){
    $scope.currentUser = userService.getCurrentUser();
    $scope.projectData = { };
    $scope.viewData = { };
    $scope.projects = [];
    $scope.showForm = false;
    $scope.$location = $location;
    $scope.logout = function(){
        userService.logout();
    };

    projectService.getUserProjects().then(function(d){ // on login get all user projects
        $scope.projects = d.data;
    });

    $scope.saveProject = function(){
        projectService.saveProject($scope.projectData).then(function(d){ // save project and add project to data.
            $state.go("project", {projectId: d.data._id})
        });
    };

    $scope.toggleForm = function(){
        $scope.viewData.showForm = !$scope.viewData.showForm;
    }

}]);
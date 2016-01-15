var app = window.angular.module("troubleshooting");

app.controller("adminController", ["$scope", "userService","projectService", "$state", "$location", function($scope, userService, projectService, $state, $location){
    $scope.currentUser = userService.getCurrentUser();
    $scope.projectData = { };
    $scope.viewData = { };
    $scope.projects = [];
    $scope.showForm = false;
    $scope.$location = $location;
    $scope.$state = $state;
    $scope.logout = function(){
        userService.logout();
    };

    projectService.getUserProjects().then(function(d){ // on login get all user projects
        $scope.projects = d.data;
    });

    $scope.saveProject = function(){
        projectService.saveProject($scope.projectData).then(function(d){ // save project and go to settings page.
            $state.go("projectSettings", { projectId: d.data._id })
        });
    };

    $scope.deleteProject = function(id){
        projectService.deleteProject(id).then(function(d){
            $scope.projects = d.data;
        })
    };

    $scope.toLink = function(projectId){
        return $location.protocol() + "://" +$location.host() + $state.href("troubleshoot",{projectId:projectId});
    };
    $scope.toggleForm = function(){
        $scope.viewData.showForm = !$scope.viewData.showForm;
    }

}]);
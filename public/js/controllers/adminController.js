var app = window.angular.module("troubleshooting");

app.controller("adminController", ["$scope", "userService","projectService","$stateParams", function($scope, userService, projectService, $stateParams){
    $scope.currentUser = userService.getCurrentUser();
    $scope.projectData = { };
    $scope.projects = [];
    projectService.getUserProjects().then(function(d){
        console.log(d);
    });
    $scope.logout = function(){
        userService.logout();
    };

    projectService.getUserProjects().then(function(d){ // on login get all user projects
        $scope.projects = d.data;
    });

    $scope.saveProject = function(){
        projectService.saveProject($scope.projectData).then(function(d){ // save project and add project to data.
            $scope.projects.push(d.data);
            resetForm();
        });
    };


    function resetForm(){
        $scope.projectData = { };
    }

}]);
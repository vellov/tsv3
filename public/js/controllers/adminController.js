var app = window.angular.module("troubleshooting");

app.controller("adminController", ["$scope", "userService","projectService", "$state", "$location", "projects", function($scope, userService, projectService, $state, $location, projects){
    $scope.currentUser = userService.getCurrentUser();
    $scope.userService = userService;
    $scope.projectData = { };
    $scope.viewData = { };
    $scope.projects = [];
    $scope.$location = $location;
    $scope.$state = $state;
    $scope.logout = function(){
        userService.logout();
    };
    $scope.projects = projects;

    $scope.saveProject = function(){
        var data = angular.copy($scope.projectData);
        data.defaultSuccessPageTitle = "Sain korda";
        data.defaultSuccessPageButtonText = "Sain korda";
        data.defaultSuccessPageContent = "<p>Hea töö! </p>";
        projectService.saveProject(data).then(function(d){ // save project and go to settings page.
            $state.go("projectSettings", { projectId: d.data._id })
        });
    };

    $scope.deleteProject = function(id){
        projectService.deleteProject(id).then(function(d){
            $scope.projects = d.data;
        })
    };

    $scope.cloneProject = function(id){
        projectService.cloneProject(id).then(function(d){
            $scope.projects.push(d.data);
        })
    };

    $scope.openProjectSettings = function(project){
        var id = $scope.projects.indexOf(project);
        projectService.openProjectModal(project,
            function(p){
                $scope.projects[id] = p;
            },
            function(){
                $scope.projects.splice(id,1);
        });
    };

    $scope.createProject = function(){
        projectService.openProjectModal({},
            function(p){
                $scope.projects.push(p);
            }
        );
    };

    $scope.toLink = function(projectId){
        return $location.protocol() + "://" + $location.host() + $state.href("troubleshoot", { projectId: projectId });
    };

    $scope.addAccess = function(projectId){
        userService.addAccess(projectId);
    }

}]);
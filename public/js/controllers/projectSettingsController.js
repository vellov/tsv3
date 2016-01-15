/**
 * Created by vellovaherpuu on 15/01/16.
 */

var app = window.angular.module("troubleshooting");

app.controller("projectSettingsController", ["$scope", "project", "projectService","$window", "utils", function($scope, project, projectService, $window, utils){
    $scope.projectSettings = angular.copy(project);
    $scope.save = function(){
        projectService.saveProject($scope.projectSettings).then(function(d){
            $window.history.back();
        });
    };

    $scope.delete = function(){
          utils.confirm("Oled kindel, et soovid kustutada?", "Tagasi teed enam ei ole.", function(){
              projectService.deleteProject(project._id).then(function(d){
                  $window.history.back();
              });
          }, null, "Kustuta", "Tagasi")
    };
}]);
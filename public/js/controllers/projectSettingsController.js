/**
 * Created by vellovaherpuu on 15/01/16.
 */

var app = window.angular.module("troubleshooting");

app.controller("projectSettingsController", ["$scope", "project", "projectService","$window", "utils", function($scope, project, projectService, $window, utils){
    $scope.utils = utils;
    $scope.projectSettings = angular.copy(project);

    $scope.save = function(){
        projectService.saveProject($scope.projectSettings).then(function(d){
            $scope.$close({ type: "SAVE", data: d.data })
        });
    };

    $scope.delete = function(){
          utils.confirm("Kustuta", "Oled kindel, et soovid kustutada?", function(){
              projectService.deleteProject(project._id).then(function(d){
                  $scope.$close({ type: "DELETE" })
              });
          }, null, "Kustuta", "Tagasi");
    };
}]);
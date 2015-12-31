/**
 * Created by vellovaherpuu on 31/12/15.
 */
var app = window.angular.module("troubleshooting");

app.controller("headerController", ["$scope", "userService", "$window", function($scope, userService, $window){
    $scope.userService = userService;
    $scope.logout = function(){
        userService.logout();
    };

    $scope.back = function(){
        $window.history.back();
    };

}]);
var app = window.angular.module("troubleshooting");

app.controller("adminController", ["$scope", "userService", function($scope, userService){
    $scope.currentUser = userService.getCurrentUser();
    console.log($scope.currentUser);
    $scope.logout = function(){
        userService.logout();
    }


}]);
var app = window.angular.module("troubleshooting");

app.controller("resetController", ["$scope", "userService", "$stateParams", "$state", function($scope, userService, $stateParams, $state){
    $scope.formData = {
        token: $stateParams.token
    };

    userService.resetTokenExpired($stateParams.token).then(function(d){
        $scope.tokenExpired = false;
    }, function(e){
        $scope.tokenExpired = true;
        $scope.message = e.data.message;
    });

    $scope.reset = function(){
        userService.resetPassword($scope.formData).then(function(d){
            $state.go("login");
        })
    }
}]);

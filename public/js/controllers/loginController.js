var app = window.angular.module("troubleshooting");

app.controller("loginController", ["$scope", "userService", function($scope, userService){
    $scope.viewData = {
        showLogin:true,
        showRegister:false
    };
    $scope.loginData = {};
    $scope.registerData = {};
    $scope.login = function(){
        userService.login($scope.loginData);
    };

    $scope.register = function(){
        userService.register($scope.registerData);
    };

    $scope.showRegisterView = function(){
        $scope.viewData.showLogin = false;
        $scope.viewData.showRegister = true;
    };

    $scope.showLoginView = function(){
        $scope.viewData.showLogin = true;
        $scope.viewData.showRegister = false;
    }

    $scope.logout = function(){
        userService.logout();
    }
}]);
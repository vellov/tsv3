var app = window.angular.module("troubleshooting");

app.controller("loginController", ["$scope", "userService", function($scope, userService){
    $scope.viewData = {
        showLogin:true,
        showRegister:false,
        messages:{}
    };
    $scope.loginData = {};
    $scope.registerData = {};
    $scope.forgotData = {};
    $scope.login = function(){
        userService.login($scope.loginData);
    };

    $scope.register = function(){
        userService.register($scope.registerData);
    };

    $scope.forgotPassword = function(){
        userService.forgotPassword($scope.forgotData).then(function(d){
            $scope.showLoginView();
            $scope.viewData.messages.msg = d.data.message;
        }, function(e){
            $scope.viewData.messages.err = e.data.message;
        });
    };

    function resetMessage(){
        $scope.viewData.messages = {};
    }

    function resetData(){
        $scope.registerData = {};
        $scope.loginData = {};
        $scope.forgotData = {};
    }

    $scope.showRegisterView = function(){
        $scope.viewData.showLogin = false;
        $scope.viewData.showRegister = true;
        resetMessage();
        resetData();
    };

    $scope.showLoginView = function(){
        $scope.viewData.showLogin = true;
        $scope.viewData.showRegister = false;
        $scope.viewData.showForgot = false;
        resetMessage();
        resetData();
    };

    $scope.showForgotView = function(){
        $scope.viewData.showLogin = false;
        $scope.viewData.showForgot = true;
        resetMessage();
        resetData();
    };
}]);
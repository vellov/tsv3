var appModule = angular.module('troubleshooting', [
    "ui.router",
    "ui.bootstrap",
    "ngSanitize",
    "userModule"
]);
appModule.config(["$stateProvider", "$urlRouterProvider", "$httpProvider", function($stateProvider, $urlRouterProvider, $httpProvider) {
    //
    // For any unmatched url, redirect to home
    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state("home", {
            url: "/",
            templateUrl: "templates/main.html",
            access: { requiredLogin: false }
        })

        .state("login", {
            url: "/login",
            templateUrl: "templates/login.html",
            controller: "loginController",
            access: {
                requiredLogin: false,
                redirect: true
            }
        })

        .state("adminhome", {
            url: "/adminhome",
            templateUrl: "templates/adminhome.html",
            controller: "adminController",
            access: { requiredLogin: true }
        });


    $httpProvider.interceptors.push("TokenInterceptor");
}]);

appModule.run(function($rootScope, $state, AuthenticationService, $window) {
    $rootScope.$on("$stateChangeStart", function(event, nextRoute, currentRoute) {
        //prevent admin pages for non users.
        if (nextRoute != null && nextRoute.access != null && nextRoute.access.requiredLogin && !AuthenticationService.isAuthenticated && !$window.sessionStorage.token) {
            event.preventDefault();
            $state.go("login");
        }
        // auto redirect if logged in.
        if(nextRoute != null && nextRoute.access.redirect && AuthenticationService.isAuthenticated && $window.sessionStorage.token){
            event.preventDefault();
            $state.go("adminhome");
        }
    });
});


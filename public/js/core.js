var appModule = angular.module('troubleshooting', [
    "utils",
    "ui.router",
    "ui.bootstrap",
    "ngSanitize",
    "userModule",
    "ngCkeditor",
    "ui.tree",
    "chart.js",
    "ngAnimate",
    "anim-in-out"
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

        .state("admin", {
            url: "/admin",
            templateUrl: "templates/adminhome.html",
            controller: "adminController",
            access: { requiredLogin: true },
            header:{
                show: true,
                back: false
            }
        })
        .state("project",{
            url: "/admin/:projectId",
            controller:"projectController",
            templateUrl: "templates/projectEdit.html",
            access: { requiredLogin: true },
            header:{
                show: true,
                back: true
            },
            resolve: {
                project: function($stateParams, projectService){
                    return projectService.getProjectById($stateParams.projectId).then(function(d){return d.data;});
                },
                questions: function($stateParams, projectService, $state){
                    return projectService.getProjectQuestions($stateParams.projectId).then(
                        function(d){
                            return d.data;
                        },
                        function(e){
                            $state.go("admin");
                        });
                }
            }
        })
        .state("troubleshoot",{
            url:"/ts/:projectId/:questionId?",
            controller: "questionViewController",
            templateUrl: "templates/main.html",
            access: { requiredLogin: false},
            resolve: {
                questions: function($stateParams, projectService, $state){
                    return projectService.getProjectQuestions($stateParams.projectId).then(
                        function(d){
                            return d.data;
                        },
                        function(e){
                            if(e.data.code == 1){
                                $state.go("deleted");
                            }
                        });
                }
            }
        })
        .state("statistics", {
            url:"/admin/statistics/:projectId",
            controller: "statisticsViewController",
            templateUrl: "templates/statistics.html",
            access: { requiredLogin: true},
            header:{
                show: true,
                back: true
            },
            resolve: {
                questions: function($stateParams, projectService, $state){
                    return projectService.getProjectQuestions($stateParams.projectId).then(
                        function(d){
                            return d.data;
                        },
                        function(e){
                            $state.go("admin");
                        });
                }
            }
        })
        .state("deleted", {
            url:"/err",
            templateUrl: "templates/deleted.html",
            access: { requiredLogin: false}
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
            $state.go("admin");
        }
    });

    $rootScope.$state = $state;
});


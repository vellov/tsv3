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
    "ngTagsInput"
]);

appModule.controller("headCtrl", ["$scope", "Page", function($scope, Page){
    $scope.$watch(function(){
        return Page.title();
    }, function(n){
        $scope.title = n;
    })
}]);

appModule.factory("Page", function(){
    var title = "TÜ Troubleshooting";
    return {
        title: function(){
            return title;
        },
        setTitle: function(newTitle){
            title = newTitle
        },
        resetTitle: function(){
            title = "TÜ Troubleshooting";
        }
    }
});

appModule.config(["$stateProvider", "$urlRouterProvider", "$httpProvider", "$rootScopeProvider", function($stateProvider, $urlRouterProvider, $httpProvider, $rootScopeProvider) {
    //
    // For any unmatched url, redirect to home
    $urlRouterProvider.otherwise("/");
    $rootScopeProvider.digestTtl(20); //just in case if someone makes larger tree than 20 :);
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
            },
            resolve: {
                projects: function(projectService){
                    return projectService.getUserProjects().then(function(d){ // on login get all user projects
                        return d.data;
                    });
                }
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
                questions: function($stateParams, projectService, $state, statisticsService, Page){
                    if(statisticsService.getLastViewData().projectId != $stateParams.projectId ){
                        projectService.getProjectById($stateParams.projectId).then(function(d){
                            Page.setTitle(d.data.pageTitle ? d.data.pageTitle : d.data.projectName);
                        })
                    }
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
        .state("projectSettings", {
            url:"/settings/:projectId",
            controller:"projectSettingsController",
            templateUrl:"templates/projectSettings.html",
            access: { requiredLogin: true },
            header:{
                show: true,
                back: true
            },
            resolve: {
                project: function($stateParams, projectService){
                    return projectService.getProjectById($stateParams.projectId).then(function(d){
                        return d.data;
                    },
                    function(e){
                        if(e.data.code == 1){
                            $state.go("deleted");
                        }
                    })
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
                questions: function($stateParams, statisticsService, $state){
                    return statisticsService.getQuestionStatistics($stateParams.projectId).then(
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

appModule.run(function($rootScope, $state, AuthenticationService, $window, Page) {
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

        if(nextRoute.name != "troubleshoot"){
            Page.resetTitle();
        }
    });

    $rootScope.$state = $state;
});

appModule.directive('stateClass', ['$state', "utils", function($state, utils) {
    return {
        link: function($scope, $element, $attrs) {
            var stateName = $state.current.name || 'init',
                normalizedStateName = 'state-' + stateName.replace(/\./g, '-');
            $element.addClass(normalizedStateName);

            $scope.$watch(function(){
                return utils.getClass();
            }, function(n,o){
                $element.removeClass(o);
                $element.addClass(n);
            });
        }
    }
}]);

var app = window.angular.module("troubleshooting");

app.controller("questionViewController", ["$scope","projectService", "userService", "questions", "$stateParams", "statisticsService", "$sce", "$state", function($scope, projectService, userService, questions, $stateParams, statisticsService, $sce, $state) {

    $scope.viewData = { };
    function findQuestionById(questionId){
        for(var i in questions){
            if(questions[i]._id == questionId){
                return questions[i];
            }
        }
    }

    function findQuestionsByParentId(parentId){
        var result = [];
        if(!parentId) parentId = "";
        for (var i in questions){
            if(questions[i].parentId == parentId){
                result.push(questions[i]);
            }
        }
        return result;
    }

    function setBackOrForward(questionId){
        var currentQuestion = findQuestionById(questionId);
        if(statisticsService.getLastViewData().questionId){
            var oldQuestion = findQuestionById(statisticsService.getLastViewData().questionId);

            if(currentQuestion.parentId == oldQuestion._id){
                statisticsService.addForward(questionId);
            }
            else if(currentQuestion._id == oldQuestion.parentId){
                statisticsService.addBack(questionId);
            }
        }
    }
    $scope.$on("$stateChangeStart", function(event, nextRoute, nextParams, fromRoute, fromParams) {
        statisticsService.setLastViewData(fromParams);
    });


    $scope.$watch(function(){
        return $stateParams.questionId;
    }, function(n){
        if(!n){
            $scope.viewData.activeQuestion = findQuestionsByParentId()[0]; // finds root (always only 1 root question)
        } else {
            $scope.viewData.activeQuestion = findQuestionById(n);
        }
        $scope.viewData.children = findQuestionsByParentId($scope.viewData.activeQuestion._id);
        statisticsService.addHit($scope.viewData.activeQuestion._id);
        setBackOrForward($scope.viewData.activeQuestion._id);
    });

    $scope.trustAsHtml = function(string) {
        return $sce.trustAsHtml(string);
    };

}]);
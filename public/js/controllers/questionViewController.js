var app = window.angular.module("troubleshooting");

app.controller("questionViewController", ["$scope","projectService", "userService", "questions", "$stateParams", "statisticsService", function($scope, projectService, userService, questions, $stateParams, statisticsService) {

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
    });

    $scope.addForward = function(){
        statisticsService.addForward($scope.viewData.activeQuestion._id);

    };
    $scope.back = function(){
        statisticsService.addBack($scope.viewData.activeQuestion._id);
    };


}]);